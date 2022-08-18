export class VCoreList<V> implements Iterable<V> {
  private _storage: V[];
  public constructor() {
    this._storage = [];
  }
  public add(item: V): void {
    this._storage.push(item);
  }
  public remove(item: V): boolean {
    const idx = this._storage.indexOf(item);
    if (idx >= 0) {
      this._storage.splice(idx, 1);
      return true;
    }
    return false;
  }
  public removeAt(idx: number): void {
    this._storage.splice(idx, 1);
  }
  public get(idx: number): V | undefined {
    return this._storage[idx];
  }
  public set(idx: number, value: V): void {
    this._storage[idx] = value;
  }
  public getCount(): number {
    return this._storage.length;
  }
  public [Symbol.iterator](): Iterator<V> {
    return this._storage.values();
  }
}
