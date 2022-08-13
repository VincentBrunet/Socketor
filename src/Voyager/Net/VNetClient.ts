import { VNetConnection } from "./VNetConnection.ts";

export interface VNetClientParams {
  ssl: boolean;
  host: string;
  port: number;
  caCerts?: string[];
  certFile?: string;
}

export class VNetClient {
  private _params: VNetClientParams;
  constructor(params: VNetClientParams) {
    this._params = params;
  }
  async connect(): Promise<VNetConnection> {
    if (this._params.ssl) {
      return new VNetConnection(
        await Deno.connectTls({
          hostname: this._params.host,
          port: this._params.port,
          caCerts: this._params.caCerts,
          certFile: this._params.certFile,
        }),
      );
    } else {
      return new VNetConnection(
        await Deno.connect({
          hostname: this._params.host,
          port: this._params.port,
        }),
      );
    }
  }
}
