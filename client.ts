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

  await writer.writeMessage((outputBuffer: VNetBuffer): void => {
    outputBuffer.writeInt32(LRoomPacket.AuthRequest);
    outputBuffer.writeString("vincent"); // token
  });

  setInterval(() => {
    writer.writeMessage((outputBuffer: VNetBuffer): void => {
      outputBuffer.writeInt32(LRoomPacket.StatusRequest);
    });
  }, 3000);

  await reader.readMessages(async (inputBuffer: VNetBuffer) => {
    const packet = inputBuffer.readInt32();
    switch (packet) {
      case LRoomPacket.AuthPayload: {
        console.log("Connected!", "myId:", inputBuffer.readInt32());
        return;
      }
      case LRoomPacket.Ping: {
        await writer.writeMessage((outputBuffer: VNetBuffer): void => {
          outputBuffer.writeInt32(LRoomPacket.Pong);
          outputBuffer.writeInt32(inputBuffer.readInt32());
        });
        return;
      }
      case LRoomPacket.StatusPayload: {
        const counter = inputBuffer.readInt32();
        console.log("--", counter, "users");
        for (let i = 0; i < counter; i++) {
          console.log(
            "user",
            "id",
            inputBuffer.readInt32(),
            "alive time",
            inputBuffer.readInt32(),
            "alive ping",
            inputBuffer.readInt32(),
            "username",
            inputBuffer.readString(),
          );
        }
        return;
      }
      case LRoomPacket.Invalid: {
        console.log("unknown packet", packet, inputBuffer.readString());
        return;
      }
    }
    console.log("packet", packet);
    console.log("inputBuffer", inputBuffer);
  });
}

main();
