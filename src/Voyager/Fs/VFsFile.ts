export class VFsFile {
  private _path: string;
  public constructor(path: string) {
    this._path = path;
  }
  public async readText(): Promise<string> {
    return await Deno.readTextFile(this._path);
  }
}
