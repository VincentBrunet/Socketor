import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetReaderDelegate = (bufferRead: VNetBuffer) => Promise<void> | void;

export class VNetReader {
  private _connection: VNetConnection;
  private _pool: VNetPool;
  constructor(
    connection: VNetConnection,
    pool: VNetPool,
  ) {
    this._connection = connection;
    this._pool = pool;
  }
  async read(deserialize: VNetReaderDelegate): Promise<void> {
    const lengthBuffer = this._pool.obtain(4);
    while (true) {
      const lengthResult = await this.readBuffer(lengthBuffer, 4);
      if (!lengthResult) {
        break;
      }
      lengthBuffer.rewind();
      const payloadSize = lengthBuffer.readInt32();
      console.log("readPayload", payloadSize);
      if (payloadSize <= 0 || payloadSize >= 10_000_000) {
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
  private async readBuffer(buffer: VNetBuffer, readSize: number): Promise<boolean> {
    let readCounter = 0;
    while (readCounter < readSize) {
      const readArray = buffer.subarray(readCounter, readSize);
      const readCurrent = await this._connection.read(readArray);
      console.log("readCurrent", readCurrent)
      if (readCurrent <= 0) {
        return false;
      }
      readCounter += readCurrent;
    }
    return true;
  }
}
