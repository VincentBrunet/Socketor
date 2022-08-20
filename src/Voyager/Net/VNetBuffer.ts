const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class VNetBuffer {
  private _array: Uint8Array;
  private _data: DataView;
  private _indexReader: number;
  private _indexWriter: number;

  public constructor(capacity: number) {
    this._array = new Uint8Array(0);
    this._data = new DataView(this._array.buffer);
    this._indexReader = 0;
    this._indexWriter = 0;
    this.ensureCapacity(capacity);
  }

  public getMemory(start: number, end: number): Uint8Array {
    this.ensureCapacity(end);
    return this._array.subarray(start, end);
  }

  public computeCapacity(capacity: number): number {
    return 1 << 32 - Math.clz32(capacity - 1);
  }
  public ensureCapacity(capacity: number): void {
    if (capacity <= this._array.length) {
      return;
    }
    const lastArray = this._array;
    this._array = new Uint8Array(this.computeCapacity(capacity));
    this._array.set(lastArray);
    this._data = new DataView(this._array.buffer);
  }
  public getCapacity(): number {
    return this._array.length;
  }

  public setIndexReader(index: number): void {
    this.ensureCapacity(index);
    this._indexReader = index;
  }
  public setIndexWriter(index: number): void {
    this.ensureCapacity(index);
    this._indexWriter = index;
  }

  public getIndexReader(): number {
    return this._indexReader;
  }
  public getIndexWriter(): number {
    return this._indexWriter;
  }

  public readInt32(): number {
    const start = this.getIndexReader();
    const end = start + 4;
    this.setIndexReader(end);
    return this._data.getInt32(start, true);
  }
  public readFloat32(): number {
    const start = this.getIndexReader();
    const end = start + 4;
    this.setIndexReader(end);
    return this._data.getFloat32(start, true);
  }
  public readString(): string | undefined {
    const bytes = this.readInt32();
    if (bytes <= -1) {
      return undefined;
    }
    const start = this.getIndexReader();
    const end = start + bytes;
    this.setIndexReader(end);
    return textDecoder.decode(this.getMemory(start, end));
  }
  public readMemory(): Uint8Array | undefined {
    const bytes = this.readInt32();
    if (bytes <= -1) {
      return undefined;
    }
    const start = this.getIndexReader();
    const end = start + bytes;
    this.setIndexReader(end);
    return this.getMemory(start, end);
  }

  public writeInt32(value: number): void {
    const start = this.getIndexWriter();
    const end = start + 4;
    this.setIndexWriter(end);
    this._data.setInt32(start, value, true);
  }
  public writeFloat32(value: number): void {
    const start = this.getIndexWriter();
    const end = start + 4;
    this.setIndexWriter(end);
    this._data.setFloat32(start, value, true);
  }
  public writeString(value: string | undefined): void {
    if (value === undefined) {
      this.writeInt32(-1);
      return;
    }
    const prefixStart = this.getIndexWriter();
    const dataStart = prefixStart + 4;
    const estimatedBytes = value.length * 4;
    const estimatedEnd = dataStart + estimatedBytes;
    const memory = this.getMemory(dataStart, estimatedEnd);
    const dataBytes = textEncoder.encodeInto(value, memory).written;
    const dataEnd = dataStart + dataBytes;
    this.writeInt32(dataBytes);
    this.setIndexWriter(dataEnd);
  }
  public writeMemory(value: Uint8Array | undefined): void {
    if (value === undefined) {
      this.writeInt32(-1);
      return;
    }
    const bytes = value.length;
    this.writeInt32(bytes);
    const start = this.getIndexWriter();
    const end = start + bytes;
    this.setIndexWriter(end);
    this.getMemory(start, end).set(value);
  }
}
