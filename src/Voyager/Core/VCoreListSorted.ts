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
    const index = this.findIndex(position);
    this._storage.splice(index, 0, value);
  }

  public removeAt(index: number): void {
    this._storage.splice(index, 1);
  }

  public findIndex(position: number): number {
    let indexStart = 0;
    let indexEnd = this._storage.length;
    while (indexStart < indexEnd) {
      const indexMid = Math.floor((indexStart + indexEnd) / 2);
      const valueMid = this._storage[indexMid];
      if (valueMid === undefined) {
        break;
      }
      const positionMid = this._position(valueMid);
      if (positionMid <= position) {
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
}
