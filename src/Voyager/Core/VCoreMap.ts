export class VCoreMap<K, V> {
  private _storage: Map<K, V>;
  constructor() {
    this._storage = new Map<K, V>();
  }
  public set(key: K, value: V): void {
    this._storage.set(key, value);
  }
  public get(key: K): V | undefined {
    return this._storage.get(key);
  }
  public count(): number {
    return this._storage.size;
  }
  public keys(): IterableIterator<K> {
    return this._storage.keys();
  }
  public values(): IterableIterator<V> {
    return this._storage.values();
  }
}
