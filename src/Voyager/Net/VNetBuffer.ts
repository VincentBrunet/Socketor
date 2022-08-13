const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function computeCapacity(capacity: number): number {
  return 1 << 32 - Math.clz32(capacity - 1);
}

export class VNetBuffer {
  private _index: number;
  private _array: Uint8Array;
  private _data: DataView;

  public constructor(size: number) {
    const capacity = computeCapacity(size);
    this._index = 0;
    this._array = new Uint8Array(capacity);
    this._data = new DataView(this._array.buffer);
  }

  public ensure(size: number): void {
    if (size <= this._array.length) {
      return;
    }
    const lastArray = this._array;
    const capacity = computeCapacity(size);
    this._array = new Uint8Array(capacity);
    this._array.set(lastArray);
    this._data = new DataView(this._array.buffer);
  }

  public subarray(start: number, end: number): Uint8Array {
    this.ensure(end);
    return this._array.subarray(start, end);
  }

  public capacity(): number {
    return this._array.length;
  }

  public rewind(): void {
    this._index = 0;
  }
  public index(): number {
    return this._index;
  }

  public readInt32(): number {
    const value = this._data.getInt32(this._index, true);
    this._index += 4;
    return value;
  }
  public readFloat32(): number {
    const value = this._data.getFloat32(this._index, true);
    this._index += 4;
    return value;
  }
  public readString(): string | undefined {
    const bytes = this.readInt32();
    if (bytes <= -1) {
      return undefined;
    }
    const start = this._index;
    const end = start + bytes;
    const subarray = this.subarray(start, end);
    const string = textDecoder.decode(subarray);
    this._index += bytes;
    return string;
  }

  public writeInt32(value: number): void {
    this.grow(4);
    this._data.setInt32(this._index, value, true);
    this._index += 4;
  }
  public writeFloat32(value: number): void {
    this.grow(4);
    this._data.setFloat32(this._index, value, true);
    this._index += 4;
  }
  public writeString(value: string | undefined): void {
    if (value === undefined) {
      return this.writeInt32(-1);
    }
    const estimated = value.length * 4;
    this.grow(4 + estimated);
    const start = this._index + 4;
    const end = start + estimated;
    const subarray = this.subarray(start, end);
    const result = textEncoder.encodeInto(value, subarray);
    const bytes = result.written;
    this._data.setInt32(this._index, bytes, true);
    this._index += 4 + bytes;
  }

  private grow(size: number): void {
    this.ensure(this._index + size);
  }
}
