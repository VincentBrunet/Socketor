import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetReaderDeserializer = (
  buffer: VNetBuffer,
  bytes: number,
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
      await this.readToBuffer(buffer, 4);
      buffer.setPosition(0);
      const bytes = buffer.readInt32();
      if (bytes <= 0 || bytes >= 1024 * 1024 * 32) {
        throw Error("Invalid read payload length:" + bytes);
      }
      await this.readToBuffer(buffer, bytes);
      buffer.setPosition(0);
      await deserializer(buffer, bytes);
    } finally {
      this._pool.recycle(buffer);
    }
  }

  private async readToBuffer(
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    let sum = 0;
    while (sum < bytes) {
      const memory = buffer.getMemory(sum, bytes);
      const counter = await this._connection.read(memory);
      if (counter <= 0) {
        throw Error("Failed to read " + bytes + " bytes");
      }
      sum += counter;
    }
  }
}
