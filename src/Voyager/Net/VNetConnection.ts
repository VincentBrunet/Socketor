export class VNetConnection {
  private _connection: Deno.Conn;
  constructor(connection: Deno.Conn) {
    this._connection = connection;
  }
  id(): number {
    return this._connection.rid;
  }
  async write(data: Readonly<Uint8Array>): Promise<number> {
    return await this._connection.write(data);
  }
  async read(buffer: Readonly<Uint8Array>): Promise<number> {
    const size = await this._connection.read(buffer);
    if (size === null) {
      return 0;
    }
    return size;
  }
  close(): void {
    this._connection.close();
  }
}
