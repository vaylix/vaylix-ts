import { Socket, connect as connectTcp } from 'node:net';
import { connect as connectTls, TLSSocket } from 'node:tls';
import { ConnectionError, TimeoutError } from '../errors/index.js';
import { readOptionalFile } from '../config/resolve.js';
import type { ResolvedClientConfig } from '../config/types.js';

export async function openSocket(config: ResolvedClientConfig): Promise<Socket | TLSSocket> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const onError = (error: Error): void => reject(new ConnectionError(error.message, { cause: error }));
    const onTimeout = (): void => reject(new TimeoutError('connection timeout'));

    const common = {
      host: config.host,
      port: config.port,
      timeout: config.connectTimeoutMs,
    };

    const socket = config.tls.enabled
      ? connectTls({
          ...common,
          servername: config.tls.servername ?? config.host,
          rejectUnauthorized: config.tls.rejectUnauthorized ?? true,
          ca: readOptionalFile(config.tls.caFile),
          cert: readOptionalFile(config.tls.certFile),
          key: readOptionalFile(config.tls.keyFile),
        })
      : connectTcp(common);

    socket.once('error', onError);
    socket.once('timeout', onTimeout);
    const onConnected = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      socket.off('error', onError);
      socket.off('timeout', onTimeout);
      socket.setKeepAlive(true);
      resolve(socket);
    };
    if (socket instanceof TLSSocket) {
      socket.once('secureConnect', onConnected);
    } else {
      socket.once('connect', onConnected);
    }
  });
}
