const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class VNetBuffer {
  private _array: Uint8Array;
  private _data: DataView;
  private _indexReader: number;
  private _indexWriter: number;

  public constructor(size: number) {
    const capacity = this.computeCapacity(size);
    this._array = new Uint8Array(capacity);
    this._data = new DataView(this._array.buffer);
    this._indexReader = 0;
    this._indexWriter = 0;
  }

  public getMemory(start: number, end: number): Uint8Array {
    this.ensureCapacity(end);
    return this._array.subarray(start, end);
  }

  public computeCapacity(capacity: number): number {
    return 1 << 32 - Math.clz32(capacity - 1);
  }
  public ensureCapacity(size: number): void {
    if (size <= this._array.length) {
      return;
    }
    const lastArray = this._array;
    const capacity = this.computeCapacity(size);
    this._array = new Uint8Array(capacity);
    this._array.set(lastArray);
    this._data = new DataView(this._array.buffer);
  }
  public getCapacity(): number {
    return this._array.length;
  }

  public setIndexReader(index: number): void {
    this._indexReader = index;
  }
  public setIndexWriter(index: number): void {
    this._indexWriter = index;
  }

  public getIndexReader(): number {
    return this._indexReader;
  }
  public getIndexWriter(): number {
    return this._indexWriter;
  }

  public readInt32(): number {
    const value = this._data.getInt32(this._indexReader, true);
    this._indexReader += 4;
    return value;
  }
  public readFloat32(): number {
    const value = this._data.getFloat32(this._indexReader, true);
    this._indexReader += 4;
    return value;
  }
  public readString(): string | undefined {
    const bytes = this.readInt32();
    if (bytes <= -1) {
      return undefined;
    }
    const start = this._indexReader;
    const end = start + bytes;
    const memory = this.getMemory(start, end);
    this._indexReader = end;
    return textDecoder.decode(memory);
  }

  public writeInt32(value: number): void {
    this.ensureCapacity(this._indexWriter + 4);
    this._data.setInt32(this._indexWriter, value, true);
    this._indexWriter += 4;
  }
  public writeFloat32(value: number): void {
    this.ensureCapacity(this._indexWriter + 4);
    this._data.setFloat32(this._indexWriter, value, true);
    this._indexWriter += 4;
  }
  public writeString(value: string | undefined): void {
    if (value === undefined) {
      this.writeInt32(-1);
      return;
    }
    const estimated = value.length * 4;
    const start = this._indexWriter + 4;
    const end = start + estimated;
    const memory = this.getMemory(start, end);
    const bytes = textEncoder.encodeInto(value, memory).written;
    this.writeInt32(bytes);
    this._indexWriter += bytes;
  }
  public writeArray(value: Uint8Array): void {
    const start = this._indexWriter;
    const end = start + value.length;
    const memory = this.getMemory(start, end);
    memory.set(value);
  }
}
