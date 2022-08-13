import { VNetPool } from "./src/Voyager/Net/VNetPool.ts";
import { VNetReader } from "./src/Voyager/Net/VNetReader.ts";
import { VNetWriter } from "./src/Voyager/Net/VNetWriter.ts";
import { VNetClient } from "./src/Voyager/Net/VNetClient.ts";
import { VNetBuffer } from "./src/Voyager/Net/VNetBuffer.ts";
import { VNetAddress } from "./src/Voyager/Net/VNetAddress.ts";

async function main(): Promise<void> {
  const address = new VNetAddress("127.0.0.1", 10000, false);
  const client = new VNetClient({
    address: address,
  });
  const connection = await client.connect();
  const pool = new VNetPool();
  const reader = new VNetReader(connection, pool);
  const writer = new VNetWriter(connection, pool);

  await writer.write((buffer: VNetBuffer): void => {
    const parts = [];
    for (let i = 0; i < 1000000; i++) {
      parts.push(
        "this is line:" + i +
          " -> and this is some garbage content that will take some space",
      );
    }
    buffer.writeString("This is another:\n" + parts.join("\n"));
  });

  await reader.read((buffer: VNetBuffer): void => {
    console.log("READ", buffer.readString().length);
  });
}

main();
