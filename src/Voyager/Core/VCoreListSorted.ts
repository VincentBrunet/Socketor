export class VCoreListSorted<V> implements Iterable<V> {
  private _position: (v: V) => number;
  private _storage: V[];

  public constructor(position: (v: V) => number) {
    this._position = position;
    this._storage = [];
  }

  public get(index: number): V | undefined {
    return this._storage[index];
  }

  public insert(value: V): void {
    const position = this._position(value);
    const indexAfter = this.findIndexAfterPosition(position);
    this._storage.splice(indexAfter, 0, value);
  }

  public remove(value: V): void {
    const position = this._position(value);
    const indexBefore = this.findIndexBeforePosition(position);
    const indexAfter = this.findIndexAfterPosition(position);
    for (let i = indexBefore; i < indexAfter; i++) {
      if (this._storage[i] === value) {
        this.removeAt(i);
        return;
      }
    }
  }

  public removeAt(index: number): void {
    this._storage.splice(index, 1);
  }

  public findIndexBeforePosition(position: number): number {
    return this.findIndexPosition(position, VCoreListSorted.comparerBefore);
  }
  public findIndexAfterPosition(position: number): number {
    return this.findIndexPosition(position, VCoreListSorted.comparerAfter);
  }

  private findIndexPosition(
    position: number,
    comparer: (a: number, b: number) => boolean,
  ): number {
    let indexStart = 0;
    let indexEnd = this._storage.length;
    while (indexStart < indexEnd) {
      const indexMid = Math.floor((indexStart + indexEnd) / 2);
      const valueMid = this._storage[indexMid];
      if (valueMid === undefined) {
        break;
      }
      const positionMid = this._position(valueMid);
      if (comparer(positionMid, position)) {
        indexStart = indexMid + 1;
      } else {
        indexEnd = indexMid;
      }
    }
    return indexStart;
  }

  public getCount(): number {
    return this._storage.length;
  }
  public [Symbol.iterator](): Iterator<V> {
    return this._storage.values();
  }

  private static comparerBefore(a: number, b: number): boolean {
    return a < b;
  }
  private static comparerAfter(a: number, b: number): boolean {
    return a <= b;
  }
}
