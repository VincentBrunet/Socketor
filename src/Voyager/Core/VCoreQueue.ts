export class VCoreQueue<V> {
  private _storage: V[] = [];
  public enqueue(item: V): void {
    this._storage.push(item);
  }
  public dequeue(): V | undefined {
    return this._storage.shift();
  }
  public count(): number {
    return this._storage.length;
  }
}
