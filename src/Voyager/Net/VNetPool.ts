import { VCoreMapList } from "../Core/VCoreMapList.ts";
import { VNetBuffer } from "./VNetBuffer.ts";

export class VNetPool {
  private buffersByBucket = new VCoreMapList<number, VNetBuffer>();
  obtain(capacity: number): VNetBuffer {
    const bucket = this.bucket(capacity);
    const list = this.buffersByBucket.get(bucket);
    if (!list || list.count() <= 0) {
      return new VNetBuffer(capacity);
    }
    const index = list.count();
    const buffer = list.get(index);
    if (!buffer) {
      return new VNetBuffer(capacity);
    }
    list.removeAt(index);
    return buffer;
  }
  recycle(buffer: VNetBuffer): void {
    const bucket = this.bucket(buffer.capacity());
    buffer.rewind();
    this.buffersByBucket.add(bucket, buffer);
  }
  private bucket(capacity: number): number {
    return Math.clz32(capacity);
  }
}
