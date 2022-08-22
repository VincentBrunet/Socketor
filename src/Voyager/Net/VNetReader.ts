import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetReaderDeserializer = (
  buffer: VNetBuffer,
  size: number,
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
    while (!this._connection.getClosed()) {
      await this.readMessage(deserializer);
    }
  }

  private async readMessage(
    deserializer: VNetReaderDeserializer,
  ): Promise<void> {
    const buffer = this._pool.obtain();
    try {
      await this.readBuffer(buffer, 4);
      buffer.setPosition(0);
      const bytes = buffer.readInt32();
      if (bytes <= 0) {
        throw Error("Invalid read payload length:" + bytes);
      }
      await this.readBuffer(buffer, bytes);
      buffer.setPosition(0);
      await deserializer(buffer, bytes);
    } finally {
      this._pool.recycle(buffer);
    }
  }

  private async readBuffer(
    buffer: VNetBuffer,
    size: number,
  ): Promise<void> {
    let sum = 0;
    while (sum < size) {
      const memory = buffer.getMemory(sum, size);
      const counter = await this._connection.read(memory);
      if (counter <= 0) {
        throw Error("Failed to read");
      }
      sum += counter;
    }
  }
}
