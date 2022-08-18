export class LRoomUser {
  private _username: string;

  public constructor(username: string) {
    this._username = username;
  }

  public getUsername(): string {
    return this._username;
  }
}
