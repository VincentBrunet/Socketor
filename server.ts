import { VFsFile } from "./src/Voyager/Fs/VFsFile.ts";
import { VNetConnection } from "./src/Voyager/Net/VNetConnection.ts";
import { VNetReader } from "./src/Voyager/Net/VNetReader.ts";
import { VNetPool } from "./src/Voyager/Net/VNetPool.ts";
import { VNetServer } from "./src/Voyager/Net/VNetServer.ts";
import { VNetWriter } from "./src/Voyager/Net/VNetWriter.ts";
import { VNetBuffer } from "./src/Voyager/Net/VNetBuffer.ts";

const pool = new VNetPool();

async function main(): Promise<void> {
  const certFile = new VFsFile("./cert/socketor.host.crt");
  const keyFile = new VFsFile("./cert/socketor.host.key");

  const cert = await certFile.readText();
  const key = await keyFile.readText();

  const server = new VNetServer({
    ssl: false,
    host: "localhost",
    port: 10000,
    cert: cert,
    key: key,
  });

  await server.listen(async (connection: VNetConnection) => {
    const id = connection.id();
    const reader = new VNetReader(connection, pool);
    const writer = new VNetWriter(connection, pool);
    try {
      await reader.read((bufferRead: VNetBuffer) => {
        const messageString = bufferRead.readString();
        console.log("READ", id, messageString.length);
        writer.write((bufferWrite: VNetBuffer) => {
          bufferWrite.writeString(messageString);
          console.log("WRITE", id, messageString.length);
        })
      });
    } catch (error) {
      console.log("Error with client", id, error);
    }
  });
}

main();
