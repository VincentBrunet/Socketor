export class VCoreList<V> implements Iterable<V> {
  private _storage: V[] = [];
  add(item: V): void {
    this._storage.push(item);
  }
  remove(item: V): boolean {
    const idx = this._storage.indexOf(item);
    if (idx >= 0) {
      this._storage.splice(idx, 1);
      return true;
    }
    return false;
  }
  removeAt(idx: number): void {
    this._storage.splice(idx, 1);
  }
  get(idx: number): V | undefined {
    return this._storage[idx];
  }
  set(idx: number, value: V): void {
    this._storage[idx] = value;
  }
  count(): number {
    return this._storage.length;
  }
  [Symbol.iterator](): Iterator<V> {
    return this._storage.values();
  }
}
