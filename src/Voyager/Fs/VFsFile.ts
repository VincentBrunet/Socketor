export class VFsFile {
  private _path: string;
  constructor(path: string) {
    this._path = path;
  }
  async readText(): Promise<string> {
    return await Deno.readTextFile(this._path);
  }
}
