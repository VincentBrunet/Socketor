export class VNetConnection {
  private _connection: Deno.Conn;
  private _closed: boolean;

  public constructor(connection: Deno.Conn) {
    this._connection = connection;
    this._closed = false;
  }
  public getId(): number {
    return this._connection.rid;
  }
  public async write(data: Readonly<Uint8Array>): Promise<number> {
    return await this._connection.write(data);
  }
  public async read(buffer: Readonly<Uint8Array>): Promise<number> {
    const size = await this._connection.read(buffer);
    if (size === null) {
      return 0;
    }
    return size;
  }
  public close(): void {
    this._closed = true;
    this._connection.close();
  }
  public getClosed(): boolean {
    return this._closed;
  }
}
