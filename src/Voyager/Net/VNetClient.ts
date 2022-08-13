import { VNetAddress } from "./VNetAddress.ts";
import { VNetConnection } from "./VNetConnection.ts";

export interface VNetClientParams {
  address: VNetAddress;
  caCerts?: string[];
  certFile?: string;
}

export class VNetClient {
  private _params: VNetClientParams;
  public constructor(params: VNetClientParams) {
    this._params = params;
  }
  public async connect(): Promise<VNetConnection> {
    if (this._params.address.ssl()) {
      return new VNetConnection(
        await Deno.connectTls({
          hostname: this._params.address.host(),
          port: this._params.address.port(),
          caCerts: this._params.caCerts,
          certFile: this._params.certFile,
        }),
      );
    } else {
      return new VNetConnection(
        await Deno.connect({
          hostname: this._params.address.host(),
          port: this._params.address.port(),
        }),
      );
    }
  }
}
