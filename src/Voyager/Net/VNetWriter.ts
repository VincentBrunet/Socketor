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
    try {
      while (this._pendings.getCount() > 0) {
        const pending = this._pendings.dequeue();
        if (pending) {
          await this.writePending(pending);
        }
      }
    } finally {
      this._processing = false;
    }
  }

  private async writePending(
    pending: VNetWriterPending,
  ): Promise<void> {
    const buffer = this._pool.obtain();
    try {
      buffer.setPosition(0);
      buffer.writeInt32(0);
      const start = buffer.getPosition();
      await pending.serializer(buffer);
      const end = buffer.getPosition();
      const bytes = end - start;
      buffer.setPosition(0);
      buffer.writeInt32(bytes);
      await this.writeFromBuffer(buffer, end);
      pending.resolve();
    } catch (error) {
      pending.reject(error);
    } finally {
      this._pool.recycle(buffer);
    }
  }

  private async writeFromBuffer(
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    let sum = 0;
    while (sum < bytes) {
      const memory = buffer.getMemory(sum, bytes);
      const counter = await this._connection.write(memory);
      if (counter <= 0) {
        throw new Error("Unable to write " + bytes + " bytes");
      }
      sum += counter;
    }
  }
}
