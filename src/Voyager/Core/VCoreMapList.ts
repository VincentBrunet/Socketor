import { VCoreList } from "./VCoreList.ts";

export class VCoreMapList<K, V> {
  private _storage: Map<K, VCoreList<V>>;
  public constructor() {
    this._storage = new Map<K, VCoreList<V>>();
  }
  public add(key: K, value: V): void {
    let list = this.get(key);
    if (list === undefined) {
      list = new VCoreList<V>();
      this._storage.set(key, list);
    }
    list.add(value);
  }
  public get(key: K): VCoreList<V> | undefined {
    return this._storage.get(key);
  }
  public getKeys(): IterableIterator<K> {
    return this._storage.keys();
  }
  public getValues(): IterableIterator<VCoreList<V>> {
    return this._storage.values();
  }
}
