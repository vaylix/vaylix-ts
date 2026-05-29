import { ProtocolError } from '../errors/index.js';

export class BufferReader {
  public constructor(private readonly buffer: Buffer, private offset = 0) {}

  public remaining(): number {
    return this.buffer.length - this.offset;
  }

  public readUInt8(): number {
    this.ensure(1);
    const value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
  }

  public readUInt16BE(): number {
    this.ensure(2);
    const value = this.buffer.readUInt16BE(this.offset);
    this.offset += 2;
    return value;
  }

  public readUInt32BE(): number {
    this.ensure(4);
    const value = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  public readBigUInt64BE(): bigint {
    this.ensure(8);
    const value = this.buffer.readBigUInt64BE(this.offset);
    this.offset += 8;
    return value;
  }

  public readBytes(length: number): Buffer {
    this.ensure(length);
    const value = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  public readString16(): string {
    return this.readBytes(this.readUInt16BE()).toString('utf8');
  }

  public readString32(): string {
    return this.readBytes(this.readUInt32BE()).toString('utf8');
  }

  public readOptionalString(): string | undefined {
    const present = this.readUInt8();
    if (present === 0) {
      return undefined;
    }
    if (present !== 1) {
      throw new ProtocolError('invalid optional string flag');
    }
    return this.readString16();
  }

  public ensureFullyRead(): void {
    if (this.remaining() !== 0) {
      throw new ProtocolError('unexpected trailing bytes');
    }
  }

  private ensure(length: number): void {
    if (this.remaining() < length) {
      throw new ProtocolError('unexpected end of payload');
    }
  }
}

export class BufferWriter {
  private readonly chunks: Buffer[] = [];

  public writeUInt8(value: number): void {
    const buf = Buffer.allocUnsafe(1);
    buf.writeUInt8(value);
    this.chunks.push(buf);
  }

  public writeUInt16BE(value: number): void {
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16BE(value);
    this.chunks.push(buf);
  }

  public writeUInt32BE(value: number): void {
    const buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(value);
    this.chunks.push(buf);
  }

  public writeBigUInt64BE(value: bigint): void {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigUInt64BE(value);
    this.chunks.push(buf);
  }

  public writeBytes(value: Uint8Array): void {
    this.chunks.push(Buffer.from(value));
  }

  public writeString16(value: string): void {
    const bytes = Buffer.from(value, 'utf8');
    this.writeUInt16BE(bytes.length);
    this.writeBytes(bytes);
  }

  public writeString32(value: string): void {
    const bytes = Buffer.from(value, 'utf8');
    this.writeUInt32BE(bytes.length);
    this.writeBytes(bytes);
  }

  public writeOptionalString(value: string | undefined): void {
    if (value === undefined) {
      this.writeUInt8(0);
      return;
    }
    this.writeUInt8(1);
    this.writeString16(value);
  }

  public toBuffer(): Buffer {
    return Buffer.concat(this.chunks);
  }
}
