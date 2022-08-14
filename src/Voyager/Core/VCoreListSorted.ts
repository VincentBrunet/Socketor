export type VCoreListSortedPriority<V> = (v: V) => number;

export class VCoreListSorted<V> implements Iterable<V> {
  private _priority: VCoreListSortedPriority<V>;
  private _storage: V[];

  constructor(priority: VCoreListSortedPriority<V>) {
    this._priority = priority;
    this._storage = [];
  }

  public get(index: number): V | undefined {
    return this._storage[index];
  }

  public insert(value: V): void {
    const priority = this._priority(value);
    const index = this.index(priority);
    this._storage.splice(index, 0, value);
  }

  public remove(value: V): boolean {
    const index = this._storage.indexOf(value);
    if (index >= 0) {
      this._storage.splice(index, 1);
      return true;
    }
    return false;
  }

  public removeAt(index: number): void {
    this._storage.splice(index, 1);
  }

  public index(priority: number): number {
    let indexStart = 0;
    let indexEnd = this._storage.length;
    while (indexStart < indexEnd) {
      const indexMid = Math.floor((indexStart + indexEnd) / 2);
      const valueMid = this._storage[indexMid];
      if (valueMid) {
        const priorityMid = this._priority(valueMid);
        if (priorityMid > priority) {
          indexStart = indexMid + 1;
        } else {
          indexEnd = indexMid;
        }
      } else {
        break;
      }
    }
    return indexStart;
  }

  public count(): number {
    return this._storage.length;
  }
  public [Symbol.iterator](): Iterator<V> {
    return this._storage.values();
  }
}
