export class VCoreMap<K, V> {
  private _storage: Map<K, V> = new Map<K, V>();
  set(key: K, value: V): void {
    this._storage.set(key, value);
  }
  get(key: K): V | undefined {
    return this._storage.get(key);
  }
  count(): number {
    return this._storage.size;
  }
  keys(): IterableIterator<K> {
    return this._storage.keys();
  }
  values(): IterableIterator<V> {
    return this._storage.values();
  }
}
