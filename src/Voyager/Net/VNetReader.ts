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
    deserializer: VNetReaderDeserializer,
  ): Promise<void> {
    const lengthBuffer = this._pool.obtain(4);
    try {
      while (!this._connection.getClosed()) {
        await this.readMessage(lengthBuffer, deserializer);
      }
    } finally {
      this._pool.recycle(lengthBuffer);
    }
  }

  private async readMessage(
    lengthBuffer: VNetBuffer,
    deserializer: VNetReaderDeserializer,
  ): Promise<void> {
    await this.readBuffer(lengthBuffer, 4);
    lengthBuffer.setIndexReader(0);
    const payloadLength = lengthBuffer.readInt32();
    if (payloadLength <= 0) {
      throw Error("Invalid read payload length:" + payloadLength);
    }
    await this.readPayload(payloadLength, deserializer);
  }

  private async readPayload(
    payloadLength: number,
    deserializer: VNetReaderDeserializer,
  ): Promise<void> {
    const payloadBuffer = this._pool.obtain(payloadLength);
    try {
      await this.readBuffer(payloadBuffer, payloadLength);
      payloadBuffer.setIndexReader(0);
      await deserializer(payloadBuffer);
    } finally {
      this._pool.recycle(payloadBuffer);
    }
  }

  private async readBuffer(
    buffer: VNetBuffer,
    size: number,
  ): Promise<void> {
    buffer.setIndexWriter(0);
    let sum = 0;
    while (sum < size) {
      const memory = buffer.getMemory(sum, size);
      const counter = await this._connection.read(memory);
      if (counter <= 0) {
        throw Error("Failed to read");
      }
      sum += counter;
      buffer.setIndexWriter(sum);
    }
  }
}
