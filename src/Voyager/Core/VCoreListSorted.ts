export class VCoreListSorted<V> implements Iterable<V> {
  private _ranking: (v: V) => number;
  private _storage: V[];

  public constructor(ranking: (v: V) => number) {
    this._ranking = ranking;
    this._storage = [];
  }

  public getValueAtIndex(index: number): V | undefined {
    return this._storage[index];
  }

  public insertValue(value: V): void {
    const rank = this._ranking(value);
    const indexAfter = this.findIndexAfterRank(rank);
    this._storage.splice(indexAfter, 0, value);
  }

  public removeValue(value: V): void {
    const index = this.findIndexOfValue(value);
    if (index >= 0) {
      this.removeValueAtIndex(index);
    }
  }

  public removeValueAtIndex(index: number): void {
    this._storage.splice(index, 1);
  }

  public findIndexOfValue(value: V): number {
    const rank = this._ranking(value);
    const indexBefore = this.findIndexBeforeRank(rank);
    const indexAfter = this.findIndexAfterRank(rank);
    for (let i = indexBefore; i < indexAfter; i++) {
      if (this._storage[i] === value) {
        return i;
      }
    }
    return -1;
  }

  public containsValue(value: V): boolean {
    return this.findIndexOfValue(value) >= 0;
  }

  public findIndexBeforeRank(rank: number): number {
    return this.findIndexWithRank(rank, VCoreListSorted.comparerBefore);
  }
  public findIndexAfterRank(rank: number): number {
    return this.findIndexWithRank(rank, VCoreListSorted.comparerAfter);
  }

  private findIndexWithRank(
    rank: number,
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
      const rankMid = this._ranking(valueMid);
      if (comparer(rankMid, rank)) {
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
  public getValues(): IterableIterator<V> {
    return this._storage.values();
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
