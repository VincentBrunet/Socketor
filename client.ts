//import { VFsFile } from "./src/Voyager/Fs/VFsFile.ts";
import { VNetPool } from "./src/Voyager/Net/VNetPool.ts";
import { VNetReader } from "./src/Voyager/Net/VNetReader.ts";
import { VNetWriter } from "./src/Voyager/Net/VNetWriter.ts";
import { VNetClient } from "./src/Voyager/Net/VNetClient.ts";
import { VNetBuffer } from "./src/Voyager/Net/VNetBuffer.ts";

//const certFile = new VFsFile("./cert/socketor.host.crt");

async function main(): Promise<void> {
  const client = new VNetClient({
    ssl: false,
    host: "localhost",
    port: 10000,
    //caCerts: [await certFile.readText()],
  });
  const connection = await client.connect();
  const pool = new VNetPool();
  const reader = new VNetReader(connection, pool);
  const writer = new VNetWriter(connection, pool);

  writer.write((bufferWrite: VNetBuffer):void => {
    bufferWrite.writeString("HELLO WORLD 442424242");
  });
  writer.write((bufferWrite: VNetBuffer):void => {
    const parts = [];
    for (let i =0; i < 100000; i++) {
      parts.push("this is line:" + i + " -> and this is some garbage content that will take some space");
    }
    bufferWrite.writeString("This is another:\n" + parts.join("\n"));
  });
  await reader.read((bufferRead: VNetBuffer):void => {
    console.log("READ", bufferRead.readString().length);
  });
}

main();
