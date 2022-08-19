import { VNetPool } from "./src/Voyager/Net/VNetPool.ts";
import { VNetReader } from "./src/Voyager/Net/VNetReader.ts";
import { VNetWriter } from "./src/Voyager/Net/VNetWriter.ts";
import { VNetClient } from "./src/Voyager/Net/VNetClient.ts";
import { VNetBuffer } from "./src/Voyager/Net/VNetBuffer.ts";
import { VNetAddress } from "./src/Voyager/Net/VNetAddress.ts";
import { LRoomPacket } from "./src/Live/Room/LRoomPacket.ts";

async function main(): Promise<void> {
  const address = new VNetAddress("127.0.0.1", 10000, false);
  const client = new VNetClient({
    address: address,
  });
  const connection = await client.connect();
  const pool = new VNetPool();
  const reader = new VNetReader(connection, pool);
  const writer = new VNetWriter(connection, pool);

  await writer.writeMessage((buffer: VNetBuffer): void => {
    buffer.writeInt32(LRoomPacket.AuthRequest);
    buffer.writeString("vincent"); // token
  });

  setInterval(() => {
    writer.writeMessage((output: VNetBuffer): void => {
      output.writeInt32(LRoomPacket.StatusRequest);
    });
  }, 3000);

  await reader.readMessages(async (input: VNetBuffer) => {
    const packet = input.readInt32();
    switch (packet) {
      case LRoomPacket.AuthPayload: {
        console.log("Connected!", "myId:", input.readInt32());
        return;
      }
      case LRoomPacket.Ping: {
        await writer.writeMessage((output: VNetBuffer): void => {
          output.writeInt32(LRoomPacket.Pong);
          output.writeInt32(input.readInt32());
        });
        return;
      }
      case LRoomPacket.StatusPayload: {
        const counter = input.readInt32();
        for (let i = 0; i < counter; i++) {
          console.log(
            "user",
            "id",
            input.readInt32(),
            "lag",
            input.readInt32(),
            "username",
            input.readString(),
          );
        }
        return;
      }
    }
    console.log("input", input);
  });
}

main();
