import { VNetAddress } from "./VNetAddress.ts";
import { VNetConnection } from "./VNetConnection.ts";

export interface VNetServerParams {
  address: VNetAddress;
  cert: string;
  key: string;
}

export class VNetServer {
  private _params: VNetServerParams;
  public constructor(params: VNetServerParams) {
    this._params = params;
  }
  public async listen(
    connected: (client: VNetConnection) => void,
  ): Promise<void> {
    let listener: Deno.Listener;
    if (this._params.address.ssl()) {
      listener = Deno.listenTls({
        hostname: this._params.address.host(),
        port: this._params.address.port(),
        cert: this._params.cert,
        key: this._params.key,
      });
    } else {
      listener = Deno.listen({
        hostname: this._params.address.host(),
        port: this._params.address.port(),
      });
    }
    while (true) {
      try {
        connected(new VNetConnection(await listener.accept()));
      } catch (error) {
        console.error("Error on connection", error);
      }
    }
  }
}
