export class VCoreListSorted<V> implements Iterable<V> {
  private _priority: (v: V) => number;
  private _storage: V[];

  public constructor(priority: (v: V) => number) {
    this._priority = priority;
    this._storage = [];
  }

  public getValueAtIndex(index: number): V | undefined {
    return this._storage[index];
  }

  public insertValue(value: V): void {
    const priority = this._priority(value);
    const indexAfter = this.findIndexAfterPriority(priority);
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
    const priority = this._priority(value);
    const indexBefore = this.findIndexBeforePriority(priority);
    const indexAfter = this.findIndexAfterPriority(priority);
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

  public findIndexBeforePriority(priority: number): number {
    return this.findIndexWithPriority(priority, VCoreListSorted.comparerBefore);
  }
  public findIndexAfterPriority(priority: number): number {
    return this.findIndexWithPriority(priority, VCoreListSorted.comparerAfter);
  }

  private findIndexWithPriority(
    priority: number,
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
      const priorityMid = this._priority(valueMid);
      if (comparer(priorityMid, priority)) {
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
