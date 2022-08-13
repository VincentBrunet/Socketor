import { VCoreMapList } from "../Core/VCoreMapList.ts";
import { VNetBuffer } from "./VNetBuffer.ts";

export class VNetPool {
  private buffersByBucket = new VCoreMapList<number, VNetBuffer>();
  public obtain(capacity: number): VNetBuffer {
    const bucket = this.bucket(capacity);
    const buffers = this.buffersByBucket.get(bucket);
    if (!buffers || buffers.count() <= 0) {
      return new VNetBuffer(capacity);
    }
    const last = buffers.count() - 1;
    const buffer = buffers.get(last);
    if (!buffer) {
      return new VNetBuffer(capacity);
    }
    buffers.removeAt(last);
    return buffer;
  }
  public recycle(buffer: VNetBuffer): void {
    const bucket = this.bucket(buffer.capacity());
    this.buffersByBucket.add(bucket, buffer);
  }
  private bucket(capacity: number): number {
    const clz = Math.clz32(capacity);
    return Math.floor(clz / 8);
  }
}
