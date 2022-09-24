export class LRoomIdentity {
  private _username: string;
  private _capabilities: string;

  public constructor(name: string, capabilities: string) {
    this._username = name;
    this._capabilities = capabilities;
  }

  public getUsername(): string {
    return this._username;
  }

  public getCapabilities(): string {
    return this._capabilities;
  }
}
