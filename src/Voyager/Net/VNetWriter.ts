import { VCoreQueue } from "../Core/VCoreQueue.ts";
import { VNetBuffer } from "./VNetBuffer.ts";
import { VNetConnection } from "./VNetConnection.ts";
import { VNetPool } from "./VNetPool.ts";

export type VNetWriterSerializer = (buffer: VNetBuffer) => Promise<void> | void;

interface VNetWriterPending {
  serializer: VNetWriterSerializer;
  resolve: () => void;
  reject: (error: Error) => void;
}

export class VNetWriter {
  private _connection: VNetConnection;
  private _pool: VNetPool;
  private _pendings: VCoreQueue<VNetWriterPending>;
  private _processing: boolean;

  public constructor(
    connection: VNetConnection,
    pool: VNetPool,
  ) {
    this._connection = connection;
    this._pool = pool;
    this._pendings = new VCoreQueue<VNetWriterPending>();
    this._processing = false;
  }

  public async writeMessage(serializer: VNetWriterSerializer): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      this._pendings.enqueue({
        serializer: serializer,
        resolve: resolve,
        reject: reject,
      });
    });
    await this.writeMessages();
    return await promise;
  }

  private async writeMessages(): Promise<void> {
    if (this._processing) {
      return;
    }
    this._processing = true;
    const lengthBuffer = this._pool.obtain(4);
    try {
      while (this._pendings.getCount() > 0) {
        const pending = this._pendings.dequeue();
        if (pending) {
          await this.writePending(lengthBuffer, pending);
        }
      }
    } finally {
      this._pool.recycle(lengthBuffer);
      this._processing = false;
    }
  }

  private async writePending(
    lengthBuffer: VNetBuffer,
    pending: VNetWriterPending,
  ): Promise<void> {
    const payloadBuffer = this._pool.obtain(1024);
    try {
      payloadBuffer.setIndexWriter(0);
      await pending.serializer(payloadBuffer);
      const payloadLength = payloadBuffer.getIndexWriter();
      lengthBuffer.setIndexWriter(0);
      lengthBuffer.writeInt32(payloadLength);
      await this.writeBuffer(lengthBuffer, 4);
      await this.writeBuffer(payloadBuffer, payloadLength);
      pending.resolve();
    } catch (error) {
      pending.reject(error);
    } finally {
      this._pool.recycle(payloadBuffer);
    }
  }

  private async writeBuffer(
    buffer: VNetBuffer,
    size: number,
  ): Promise<void> {
    buffer.setIndexReader(0);
    let sum = 0;
    while (sum < size) {
      const array = buffer.getMemory(sum, size);
      const counter = await this._connection.write(array);
      if (counter <= 0) {
        throw new Error("Unable to write: " + counter);
      }
      sum += counter;
      buffer.setIndexReader(sum);
    }
  }
}
