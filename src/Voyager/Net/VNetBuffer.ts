const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class VNetBuffer {
  private _array: Uint8Array;
  private _data: DataView;
  private _position: number;

  public constructor(capacity: number) {
    this._array = new Uint8Array(0);
    this._data = new DataView(this._array.buffer);
    this._position = 0;
    this.ensureCapacity(capacity);
  }

  public getMemory(start: number, end: number): Uint8Array {
    this.ensureCapacity(end);
    return this._array.subarray(start, end);
  }

  private computeCapacity(capacity: number): number {
    if (capacity <= 0) {
      return 0;
    }
    return 1 << Math.ceil(Math.log2(capacity));
  }
  private ensureCapacity(capacity: number): void {
    if (capacity <= this.getCapacity()) {
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

  public setPosition(position: number): void {
    this.ensureCapacity(position);
    this._position = position;
  }
  public getPosition(): number {
    return this._position;
  }

  public readInt32(): number {
    const start = this.getPosition();
    const end = start + 4;
    this.setPosition(end);
    return this._data.getInt32(start, true);
  }
  public readFloat32(): number {
    const start = this.getPosition();
    const end = start + 4;
    this.setPosition(end);
    return this._data.getFloat32(start, true);
  }
  public readString(): string | undefined {
    const bytes = this.readInt32();
    if (bytes <= -1) {
      return undefined;
    }
    const start = this.getPosition();
    const end = start + bytes;
    this.setPosition(end);
    return textDecoder.decode(this.getMemory(start, end));
  }
  public readArray<Value>(
    readItem: (buffer: VNetBuffer) => Value,
  ): Value[] | undefined {
    const count = this.readInt32();
    if (count < 0) {
      return undefined;
    }
    const array: Value[] = [];
    for (let i = 0; i < count; i++) {
      array.push(readItem(this));
    }
    return array;
  }

  public writeInt32(value: number): void {
    const start = this.getPosition();
    const end = start + 4;
    this.setPosition(end);
    this._data.setInt32(start, value, true);
  }
  public writeFloat32(value: number): void {
    const start = this.getPosition();
    const end = start + 4;
    this.setPosition(end);
    this._data.setFloat32(start, value, true);
  }
  public writeString(value: string | undefined): void {
    if (value === undefined) {
      this.writeInt32(-1);
      return;
    }
    const prefixStart = this.getPosition();
    const dataStart = prefixStart + 4;
    const estimatedBytes = value.length * 4;
    const estimatedEnd = dataStart + estimatedBytes;
    const memory = this.getMemory(dataStart, estimatedEnd);
    const dataBytes = textEncoder.encodeInto(value, memory).written;
    const dataEnd = dataStart + dataBytes;
    this.writeInt32(dataBytes);
    this.setPosition(dataEnd);
  }
  public writeArray<Value>(
    values: Value[] | undefined,
    writeItem: (buffer: VNetBuffer, value: Value) => void,
  ): void {
    if (values === undefined) {
      this.writeInt32(-1);
      return;
    }
    this.writeInt32(values.length);
    for (let i = 0; i < values.length; i++) {
      writeItem(this, values[i]);
    }
  }
}
