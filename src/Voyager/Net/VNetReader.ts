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
  public async read(deserialize: VNetReaderDeserializer): Promise<void> {
    const lengthBuffer = this._pool.obtain(4);
    while (true) {
      const lengthResult = await this.readBuffer(lengthBuffer, 4);
      if (!lengthResult) {
        break;
      }
      lengthBuffer.rewind();
      const payloadSize = lengthBuffer.readInt32();
      if (payloadSize <= 0) {
        break;
      }
      const payloadBuffer = this._pool.obtain(payloadSize);
      const payloadResult = await this.readBuffer(payloadBuffer, payloadSize);
      if (payloadResult) {
        payloadBuffer.rewind();
        await deserialize(payloadBuffer);
        this._pool.recycle(payloadBuffer);
      } else {
        this._pool.recycle(payloadBuffer);
        break;
      }
    }
    this._pool.recycle(lengthBuffer);
  }
  private async readBuffer(
    buffer: VNetBuffer,
    readSize: number,
  ): Promise<boolean> {
    let readCounter = 0;
    while (readCounter < readSize) {
      const readArray = buffer.subarray(readCounter, readSize);
      const readCurrent = await this._connection.read(readArray);
      if (readCurrent <= 0) {
        return false;
      }
      readCounter += readCurrent;
    }
    return true;
  }
}
