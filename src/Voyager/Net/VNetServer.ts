import { VNetConnection } from "./VNetConnection.ts";

export interface VNetServerParams {
  ssl: boolean;
  host: string;
  port: number;
  cert: string;
  key: string;
}

export class VNetServer {
  private _params: VNetServerParams;
  constructor(params: VNetServerParams) {
    this._params = params;
  }
  async listen(connected: (client: VNetConnection) => void): Promise<void> {
    let listener: Deno.Listener;
    if (this._params.ssl) {
      listener = Deno.listenTls({
        hostname: this._params.host,
        port: this._params.port,
        cert: this._params.cert,
        key: this._params.key,
      });
    } else {
      listener = Deno.listen({
        hostname: this._params.host,
        port: this._params.port,
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
