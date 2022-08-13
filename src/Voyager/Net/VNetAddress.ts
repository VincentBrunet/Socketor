export class VNetAddress {
  private _host: string;
  private _port: number;
  private _ssl: boolean;
  public constructor(host: string, port: number, ssl: boolean) {
    this._host = host;
    this._port = port;
    this._ssl = ssl;
  }
  public host(): string {
    return this._host;
  }
  public port(): number {
    return this._port;
  }
  public ssl(): boolean {
    return this._ssl;
  }
}
