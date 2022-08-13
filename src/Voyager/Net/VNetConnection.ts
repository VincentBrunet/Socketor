export class VNetConnection {
  private _connection: Deno.Conn;
  public constructor(connection: Deno.Conn) {
    this._connection = connection;
  }
  public id(): number {
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
    this._connection.close();
  }
}
