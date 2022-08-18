export class VCoreMap<K, V> {
  private _storage: Map<K, V>;
  public constructor() {
    this._storage = new Map<K, V>();
  }
  public set(key: K, value: V): void {
    this._storage.set(key, value);
  }
  public get(key: K): V | undefined {
    return this._storage.get(key);
  }
  public getCount(): number {
    return this._storage.size;
  }
  public getKeys(): IterableIterator<K> {
    return this._storage.keys();
  }
  public getValues(): IterableIterator<V> {
    return this._storage.values();
  }
}
