import { VCoreQueue } from "../Core/VCoreQueue.ts";
import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetWriterSerializer = (buffer: VNetBuffer) => Promise<void> | void;

interface VNetWriterTask {
  serialize: VNetWriterSerializer;
  resolve: () => void;
  reject: (error: Error) => void;
}

export class VNetWriter {
  private _tasks = new VCoreQueue<VNetWriterTask>();
  private _processing = false;
  private _connection: VNetConnection;
  private _pool: VNetPool;
  public constructor(
    connection: VNetConnection,
    pool: VNetPool,
  ) {
    this._connection = connection;
    this._pool = pool;
  }
  public async write(serialize: VNetWriterSerializer): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      this._tasks.enqueue({
        serialize: serialize,
        resolve: resolve,
        reject: reject,
      });
    });
    await this.writeAll();
    return await promise;
  }
  private async writeAll(): Promise<void> {
    if (!this._processing) {
      this._processing = true;
      const lengthBuffer = this._pool.obtain(4);
      while (this._tasks.count() > 0) {
        const task = this._tasks.dequeue();
        if (task) {
          const payloadBuffer = this._pool.obtain(1024);
          let success = false;
          try {
            payloadBuffer.rewind();
            await task.serialize(payloadBuffer);
            const size = payloadBuffer.index();
            lengthBuffer.rewind();
            lengthBuffer.writeInt32(size);
            const sentLength = await this.writeBuffer(lengthBuffer, 4);
            const sentPayload = await this.writeBuffer(payloadBuffer, size);
            success = sentLength && sentPayload;
          } catch (error) {
            task.reject(error);
          }
          this._pool.recycle(payloadBuffer);
          if (success) {
            task.resolve();
          }
        }
      }
      this._pool.recycle(lengthBuffer);
      this._processing = false;
    }
  }
  private async writeBuffer(
    buffer: VNetBuffer,
    writeSize: number,
  ): Promise<boolean> {
    let writeCounter = 0;
    while (writeCounter < writeSize) {
      const writeArray = buffer.subarray(writeCounter, writeSize);
      const writeCurrent = await this._connection.write(writeArray);
      if (writeCurrent <= 0) {
        return false;
      }
      writeCounter += writeCurrent;
    }
    return true;
  }
}
