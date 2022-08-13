import { VCoreQueue } from "../Core/VCoreQueue.ts";
import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetWriterDelegate = (buffer: VNetBuffer) => Promise<void> | void;

interface VNetWriterTask {
  serialize: VNetWriterDelegate;
  resolve: (success: boolean) => void;
}

export class VNetWriter {
  private _tasks = new VCoreQueue<VNetWriterTask>();
  private _processing = false;
  private _connection: VNetConnection;
  private _pool: VNetPool;
  constructor(
    connection: VNetConnection,
    pool: VNetPool,
  ) {
    this._connection = connection;
    this._pool = pool;
  }
  async write(serialize: VNetWriterDelegate): Promise<boolean> {
    const promise = new Promise<boolean>((resolve) => {
      this._tasks.enqueue({
        serialize: serialize,
        resolve: resolve,
      });
    });
    await this.writeNow();
    return await promise;
  }
  private async writeNow(): Promise<void> {
    if (!this._processing) {
      this._processing = true;
      const lengthBuffer = this._pool.obtain(4);
      while (this._tasks.count() > 0) {
        const task = this._tasks.dequeue();
        if (task) {
          const payloadBuffer = this._pool.obtain(1024);
          let success = false;
          try {
            await task.serialize(payloadBuffer);
            const size = payloadBuffer.index();
            lengthBuffer.rewind();
            lengthBuffer.writeInt32(size);
            const sentLength = await this.writeBuffer(lengthBuffer, 4);
            const sentPayload = await this.writeBuffer(payloadBuffer, size);
            success = sentLength && sentPayload;
          } catch (error) {
            console.log("Error sending", error);
          }
          this._pool.recycle(payloadBuffer);
          task.resolve(success);
        }
      }
      this._pool.recycle(lengthBuffer);
      this._processing = false;
    }
  }
  private async writeBuffer(buffer: VNetBuffer, writeSize: number): Promise<boolean> {
    let writeCounter = 0;
    while (writeCounter < writeSize) {
      const writeArray = buffer.subarray(writeCounter, writeSize);
      const writeCurrent = await this._connection.write(writeArray);
      console.log("writeCurrent", writeCurrent)
      if (writeCurrent <= 0) {
        return false;
      }
      writeCounter += writeCurrent;
    }
    return true;
  }
}
