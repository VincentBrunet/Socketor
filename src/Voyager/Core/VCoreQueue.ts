export class VCoreQueue<V> {
  private _storage: V[] = [];
  enqueue(item: V): void {
    this._storage.push(item);
  }
  dequeue(): V | undefined {
    return this._storage.shift();
  }
  count(): number {
    return this._storage.length;
  }
}
