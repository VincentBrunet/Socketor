import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetReaderDeserializer = (
  buffer: VNetBuffer,
) => Promise<void> | void;

export class VNetReader {
  private _connection: VNetConnection;
  private _pool: VNetPool;

  public constructor(
    connection: VNetConnection,
    pool: VNetPool,
  ) {
    this._connection = connection;
    this._pool = pool;
  }

  public async readMessages(
    deserialize: VNetReaderDeserializer,
  ): Promise<void> {
    const lengthBuffer = this._pool.obtain(4);
    try {
      while (!this._connection.closed()) {
        await this.readMessage(lengthBuffer, deserialize);
      }
    } finally {
      this._pool.recycle(lengthBuffer);
    }
  }

  private async readMessage(
    lengthBuffer: VNetBuffer,
    deserialize: VNetReaderDeserializer,
  ): Promise<void> {
    await this.readBuffer(lengthBuffer, 4);
    lengthBuffer.rewind();
    const payloadLength = lengthBuffer.readInt32();
    if (payloadLength <= 0) {
      throw Error("Invalid read payload length:" + payloadLength);
    }
    await this.readPayload(payloadLength, deserialize);
  }

  private async readPayload(
    payloadLength: number,
    deserialize: VNetReaderDeserializer,
  ): Promise<void> {
    const payloadBuffer = this._pool.obtain(payloadLength);
    try {
      await this.readBuffer(payloadBuffer, payloadLength);
      payloadBuffer.rewind();
      await deserialize(payloadBuffer);
    } finally {
      this._pool.recycle(payloadBuffer);
    }
  }

  private async readBuffer(
    buffer: VNetBuffer,
    readSize: number,
  ): Promise<void> {
    let readCounter = 0;
    while (readCounter < readSize) {
      const readArray = buffer.subarray(readCounter, readSize);
      const readCurrent = await this._connection.read(readArray);
      if (readCurrent <= 0) {
        throw Error("Failed to read");
      }
      readCounter += readCurrent;
    }
  }
}
