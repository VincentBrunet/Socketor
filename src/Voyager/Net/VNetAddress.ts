export class VNetAddress {
  private _host: string;
  private _port: number;
  private _ssl: boolean;
  public constructor(host: string, port: number, ssl: boolean) {
    this._host = host;
    this._port = port;
    this._ssl = ssl;
  }
  public getHost(): string {
    return this._host;
  }
  public getPort(): number {
    return this._port;
  }
  public getSsl(): boolean {
    return this._ssl;
  }
}
