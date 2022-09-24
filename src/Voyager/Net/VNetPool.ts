import { VCoreListSorted } from "../Core/VCoreListSorted.ts";
import { VNetBuffer } from "./VNetBuffer.ts";

export class VNetPool {
  private buffers: VCoreListSorted<VNetBuffer>;

  public constructor() {
    this.buffers = new VCoreListSorted<VNetBuffer>((buffer: VNetBuffer) => {
      return buffer.getCapacity();
    });
  }

  public obtain(): VNetBuffer {
    const last = this.buffers.getCount() - 1;
    const buffer = this.buffers.getValueAtIndex(last);
    if (buffer) {
      this.buffers.removeValueAtIndex(last);
      return buffer;
    }
    return new VNetBuffer(256 * 256);
  }

  public recycle(buffer: VNetBuffer): void {
    buffer.setPosition(0);
    this.buffers.insertValue(buffer);
  }
}
