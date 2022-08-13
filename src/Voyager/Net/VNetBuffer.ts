const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function computeCapacity(capacity: number): number {
  return 1 << 32 - Math.clz32(capacity);
}

export class VNetBuffer {
  private _index: number;
  private _capacity: number;
  private _array: Uint8Array;
  private _data: DataView;

  constructor(capacity: number) {
    this._index = 0;
    this._capacity = computeCapacity(capacity);
    this._array = new Uint8Array(this._capacity);
    this._data = new DataView(this._array.buffer);
  }

  ensure(capacity: number): void {
    if (capacity <= this._capacity) {
      return;
    }
    const lastArray = this._array;
    this._capacity = computeCapacity(capacity);
    this._array = new Uint8Array(this._capacity);
    this._array.set(lastArray);
    this._data = new DataView(this._array.buffer);
  }

  rewind(): void {
    this._index = 0;
  }

  subarray(start: number, end: number): Uint8Array {
    this.ensure(end);
    return this._array.subarray(start, end);
  }

  index(): number {
    return this._index;
  }
  capacity(): number {
    return this._capacity;
  }

  readInt32(): number {
    const value = this._data.getInt32(this._index, true);
    this._index += 4;
    return value;
  }
  readFloat32(): number {
    const value = this._data.getFloat32(this._index, true);
    this._index += 4;
    return value;
  }
  readString(): string {
    const bytes = this._data.getInt32(this._index, true);
    this._index += 4;
    const string = textDecoder.decode(
      this._array.subarray(this._index, this._index + bytes),
    );
    this._index += bytes;
    return string;
  }

  writeInt32(value: number): void {
    this.ensure(this._index + 4);
    this._data.setInt32(this._index, value, true);
    this._index += 4;
  }
  writeFloat32(value: number): void {
    this.ensure(this._index + 4);
    this._data.setFloat32(this._index, value, true);
    this._index += 4;
  }
  writeString(value: string): void {
    const estimated = value.length * 4;
    this.ensure(this._index + 4 + estimated);
    const result = textEncoder.encodeInto(
      value,
      this._array.subarray(this._index + 4),
    );
    const bytes = result.written;
    this._data.setInt32(this._index, bytes, true);
    this._index += 4 + bytes;
  }
}
