import { VFsFile } from "./src/Voyager/Fs/VFsFile.ts";
import { VNetConnection } from "./src/Voyager/Net/VNetConnection.ts";
import { VNetReader } from "./src/Voyager/Net/VNetReader.ts";
import { VNetPool } from "./src/Voyager/Net/VNetPool.ts";
import { VNetServer } from "./src/Voyager/Net/VNetServer.ts";
import { VNetWriter } from "./src/Voyager/Net/VNetWriter.ts";
import { VNetBuffer } from "./src/Voyager/Net/VNetBuffer.ts";
import { VNetAddress } from "./src/Voyager/Net/VNetAddress.ts";

const pool = new VNetPool();

async function main(): Promise<void> {
  const certFile = new VFsFile("./cert/socketor.host.crt");
  const keyFile = new VFsFile("./cert/socketor.host.key");

  const cert = await certFile.readText();
  const key = await keyFile.readText();

  const address = new VNetAddress("127.0.0.1", 10000, false);
  const server = new VNetServer({
    address: address,
    cert: cert,
    key: key,
  });

  await server.listen(async (connection: VNetConnection) => {
    const id = connection.id();
    const reader = new VNetReader(connection, pool);
    const writer = new VNetWriter(connection, pool);
    try {
      await reader.read(async (buffer: VNetBuffer) => {
        const messageString = buffer.readString();
        console.log("READ", id, messageString);
        await writer.write((buffer: VNetBuffer) => {
          if (messageString) {
            buffer.writeString(messageString);
          }
          console.log("WRITE", id, messageString);
        });
      });
    } catch (error) {
      console.log("Error with client", id, error);
    }
  });
}

main();
