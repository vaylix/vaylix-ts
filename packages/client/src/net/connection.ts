import type { Socket } from 'node:net';
import type { TLSSocket } from 'node:tls';
import {
  AuthenticationError,
  AuthorizationError,
  ConnectionError,
  FollowerWriteRejectedError,
  ProtocolError,
  ReplicationAckTimeoutError,
  ReplicationAckUnavailableError,
  ReplicationPromotionDeniedError,
  RemoteCommandError,
  TimeoutError,
} from '../errors/index.js';
import { createDeferred, type Deferred } from '../internal/deferred.js';
import { nextRequestId } from '../internal/request-id.js';
import { resolveClientConfig, log } from '../config/resolve.js';
import type { ClientConfig, ResolvedClientConfig } from '../config/types.js';
import { encodeFrame, decodeFrame, type FrameCodecOptions } from '../protocol/frame.js';
import { createClientHello, decodeServerHello, encodeClientHello } from '../protocol/hello.js';
import { encodeRequestBody, type RequestMetadata } from '../protocol/request.js';
import { decodeResponseBody, decodeErrorPayload, type DecodedResponse } from '../protocol/response.js';
import { DEFAULT_MAX_FRAME_LEN, HEADER_LEN } from '../protocol/constants.js';
import { opcodes } from '../protocol/opcodes.js';
import { openSocket } from './socket.js';

type AnySocket = Socket | TLSSocket;

export interface RequestEnvelope {
  opcode: number;
  payload: Buffer;
  metadata?: RequestMetadata;
}

export class Connection {
  private readonly config: ResolvedClientConfig;
  private socket: AnySocket | undefined;
  private frameOptions: FrameCodecOptions;
  private readonly pending = new Map<string, Deferred<DecodedResponse>>();
  private readBuffer = Buffer.alloc(0);
  private readLoopStarted = false;

  public constructor(config: ClientConfig) {
    this.config = resolveClientConfig(config);
    this.frameOptions = {
      compression: this.config.compression,
      compressionThresholdBytes: this.config.compressionThresholdBytes,
      maxFrameLen: this.config.maxFrameSize,
      maxDecompressedFrameLen: this.config.maxFrameSize,
    };
  }

  public async connect(): Promise<void> {
    if (this.socket) {
      return;
    }
    const socket = await openSocket(this.config);
    this.socket = socket;
    await this.performHandshake();
    this.startReadLoop();
    if (this.config.username !== undefined && this.config.password !== undefined) {
      await this.request({
        opcode: opcodes.Auth,
        payload: encodeAuthPayload(this.config.username, this.config.password),
      });
    }
  }

  public async close(): Promise<void> {
    for (const pending of this.pending.values()) {
      pending.reject(new ProtocolError('connection closed'));
    }
    this.pending.clear();
    this.socket?.destroy();
    this.socket = undefined;
    this.readLoopStarted = false;
    this.readBuffer = Buffer.alloc(0);
  }

  public async request(envelope: RequestEnvelope): Promise<DecodedResponse> {
    await this.connect();
    const socket = this.requireSocket();
    const requestId = nextRequestId();
    const deferred = createDeferred<DecodedResponse>();
    this.pending.set(requestId, deferred);
    try {
      const body = encodeRequestBody({
        requestId,
        opcode: envelope.opcode,
        payload: envelope.payload,
        metadata: envelope.metadata ?? {},
      });
      const frame = await encodeFrame(body, this.frameOptions);
      socket.write(frame);
      const response = await promiseWithTimeout(deferred.promise, this.config.requestTimeoutMs);
      if (response.status === 'ERROR') {
        const payload = decodeErrorPayload(response.payload);
        throw classifyRemoteError(payload);
      }
      return response;
    } finally {
      this.pending.delete(requestId);
    }
  }

  public getResolvedConfig(): ResolvedClientConfig {
    return this.config;
  }

  private async performHandshake(): Promise<void> {
    const socket = this.requireSocket();
    const hello = createClientHello({
      clientName: this.config.clientName,
      clientVersion: this.config.clientVersion,
      desiredCompression: this.config.compression,
      maxFrameLen: this.config.maxFrameSize,
      authIntent: this.config.username !== undefined && this.config.password !== undefined,
    });
    const startupOptions: FrameCodecOptions = {
      compression: 'none',
      compressionThresholdBytes: 0,
      maxFrameLen: DEFAULT_MAX_FRAME_LEN,
      maxDecompressedFrameLen: DEFAULT_MAX_FRAME_LEN,
    };
    socket.write(await encodeFrame(encodeClientHello(hello), startupOptions));
    const payload = await this.readOneFrame(startupOptions);
    const serverHello = decodeServerHello(payload);
    if (serverHello.status !== 'OK') {
      throw new ProtocolError(
        serverHello.errorMessage ?? serverHello.errorName ?? 'server rejected startup negotiation',
      );
    }
    if (serverHello.protocolVersion !== 2) {
      throw new ProtocolError(`unsupported server protocol version: ${serverHello.protocolVersion}`);
    }
    this.frameOptions = {
      compression: serverHello.compression,
      compressionThresholdBytes: this.config.compressionThresholdBytes,
      maxFrameLen: serverHello.maxFrameLen,
      maxDecompressedFrameLen: serverHello.maxFrameLen,
    };
    log(this.config.logger, 'info', 'connection.ready', {
      compression: serverHello.compression,
      maxFrameLen: serverHello.maxFrameLen,
      serverId: serverHello.serverId,
    });
  }

  private startReadLoop(): void {
    if (this.readLoopStarted) {
      return;
    }
    this.readLoopStarted = true;
    const socket = this.requireSocket();
    socket.on('data', (chunk) => {
      this.readBuffer = Buffer.concat([this.readBuffer, chunk]);
      void this.drainFrames();
    });
    socket.on('error', (error) => {
      for (const pending of this.pending.values()) {
        pending.reject(new ConnectionError('connection error', { cause: error }));
      }
      this.pending.clear();
      this.socket = undefined;
      this.readLoopStarted = false;
      this.readBuffer = Buffer.alloc(0);
    });
    socket.on('close', () => {
      for (const pending of this.pending.values()) {
        pending.reject(new ProtocolError('connection closed'));
      }
      this.pending.clear();
      this.socket = undefined;
      this.readLoopStarted = false;
      this.readBuffer = Buffer.alloc(0);
    });
  }

  private async drainFrames(): Promise<void> {
    while (this.readBuffer.length >= HEADER_LEN) {
      const length = this.readBuffer.readUInt32BE(6);
      if (this.readBuffer.length < HEADER_LEN + length) {
        return;
      }
      const frame = this.readBuffer.subarray(0, HEADER_LEN + length);
      this.readBuffer = this.readBuffer.subarray(HEADER_LEN + length);
      const { payload } = await decodeFrame(frame, this.frameOptions);
      const response = decodeResponseBody(payload);
      const pending = this.pending.get(response.requestId);
      if (pending) {
        pending.resolve(response);
      }
    }
  }

  private async readOneFrame(options: FrameCodecOptions): Promise<Buffer> {
    const socket = this.requireSocket();
    return new Promise((resolve, reject) => {
      let acc = Buffer.alloc(0);
      const onData = async (chunk: Buffer): Promise<void> => {
        acc = Buffer.concat([acc, chunk]);
        if (acc.length < HEADER_LEN) {
          return;
        }
        const length = acc.readUInt32BE(6);
        if (acc.length < HEADER_LEN + length) {
          return;
        }
        cleanup();
        try {
          const frame = acc.subarray(0, HEADER_LEN + length);
          const decoded = await decodeFrame(frame, options);
          resolve(decoded.payload);
        } catch (error) {
          reject(error);
        }
      };
      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };
      const cleanup = (): void => {
        socket.off('data', onData);
        socket.off('error', onError);
      };
      socket.on('data', onData);
      socket.on('error', onError);
    });
  }

  private requireSocket(): AnySocket {
    if (!this.socket) {
      throw new ProtocolError('connection not established');
    }
    return this.socket;
  }
}

export function classifyRemoteError(payload: { code: string; name: string; message: string }): Error {
  if (payload.code === 'SRV-008' || payload.name === 'Authentication Failed') {
    return new AuthenticationError(payload.message);
  }
  if (payload.code === 'SRV-017' || payload.name === 'Permission Denied') {
    return new AuthorizationError(payload.message);
  }
  if (payload.code === 'SRV-035' || payload.name === 'Replication Acknowledgement Timeout') {
    return new ReplicationAckTimeoutError(payload.message);
  }
  if (payload.code === 'SRV-036' || payload.name === 'Replication Acknowledgement Unavailable') {
    return new ReplicationAckUnavailableError(payload.message);
  }
  if (payload.code === 'SRV-037' || payload.name === 'Follower Write Rejected') {
    return new FollowerWriteRejectedError(payload.message);
  }
  if (payload.code === 'SRV-038' || payload.name === 'Replication Promotion Denied') {
    return new ReplicationPromotionDeniedError(payload.message);
  }
  return new RemoteCommandError('ERROR', payload);
}

function encodeAuthPayload(username: string, password: string): Buffer {
  const usernameBytes = Buffer.from(username, 'utf8');
  const passwordBytes = Buffer.from(password, 'utf8');
  const payload = Buffer.allocUnsafe(2 + usernameBytes.length + 4 + passwordBytes.length);
  let offset = 0;
  payload.writeUInt16BE(usernameBytes.length, offset);
  offset += 2;
  usernameBytes.copy(payload, offset);
  offset += usernameBytes.length;
  payload.writeUInt32BE(passwordBytes.length, offset);
  offset += 4;
  passwordBytes.copy(payload, offset);
  return payload;
}

function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError('request timed out')), timeoutMs);
    void promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
