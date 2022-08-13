import { VCoreList } from "./VCoreList.ts";

export class VCoreMapList<K, V> {
  private _storage = new Map<K, VCoreList<V>>();
  add(key: K, value: V): void {
    let list = this.get(key);
    if (list === undefined) {
      list = new VCoreList<V>();
      this._storage.set(key, list);
    }
    list.add(value);
  }
  get(key: K): VCoreList<V> | undefined {
    return this._storage.get(key);
  }
  keys(): IterableIterator<K> {
    return this._storage.keys();
  }
  values(): IterableIterator<VCoreList<V>> {
    return this._storage.values();
  }
}
