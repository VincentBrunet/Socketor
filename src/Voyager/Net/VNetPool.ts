import { VCoreListSorted } from "../Core/VCoreListSorted.ts";
import { VNetBuffer } from "./VNetBuffer.ts";

export class VNetPool {
  private buffers: VCoreListSorted<VNetBuffer>;

  constructor() {
    this.buffers = new VCoreListSorted<VNetBuffer>((buffer: VNetBuffer) => {
      return -buffer.capacity();
    });
  }

  public obtain(capacity: number): VNetBuffer {
    const index = this.buffers.index(capacity);
    const buffer = this.buffers.get(index);
    if (buffer) {
      this.buffers.removeAt(index);
      return buffer;
    }
    return new VNetBuffer(capacity);
  }
  public recycle(buffer: VNetBuffer): void {
    this.buffers.insert(buffer);
  }
}
