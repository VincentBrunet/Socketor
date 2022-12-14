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
    outputBuffer.writeInt32(LRoomPacket.AuthUp);
    outputBuffer.writeString("vincent"); // token
  });
  await writer.writeMessage((outputBuffer: VNetBuffer): void => {
    outputBuffer.writeInt32(LRoomPacket.JoinUp);
    outputBuffer.writeInt32(-42); // channek
  });

  await writer.writeMessage((outputBuffer: VNetBuffer): void => {
    outputBuffer.writeInt32(LRoomPacket.BroadcastUp);
    outputBuffer.writeInt32(-42); // channel
    outputBuffer.writeString("PAYLOAD OF BROADCAST LOL");
  });

  setInterval(() => {
    writer.writeMessage((outputBuffer: VNetBuffer): void => {
      outputBuffer.writeInt32(LRoomPacket.ListUp);
      outputBuffer.writeInt32(-42); // channel
    });
  }, 3000);

  await reader.readMessages(async (inputBuffer: VNetBuffer) => {
    const packet = inputBuffer.readInt32();
    switch (packet) {
      case LRoomPacket.InvalidDown: {
        console.log("unknown packet", packet, inputBuffer.readString());
        return;
      }
      case LRoomPacket.AuthDown: {
        console.log("Connected!", "myId:", inputBuffer.readInt32());
        return;
      }
      case LRoomPacket.KickDown: {
        console.log("Kicked request", "toward:", inputBuffer.readInt32());
        return;
      }
      case LRoomPacket.InfoDown: {
        const guests = inputBuffer.readArray((inputBuffer: VNetBuffer) => {
          return {
            id: inputBuffer.readInt32(),
            aliveTimeMs: inputBuffer.readInt32(),
            alivePingMs: inputBuffer.readInt32(),
            identityUsername: inputBuffer.readString(),
            identityCapabilities: inputBuffer.readString(),
          };
        });
        console.log("Info", "received:", guests);
        return;
      }
      case LRoomPacket.JoinDown: {
        const channelId = inputBuffer.readInt32();
        console.log("joined channel", channelId);
        return;
      }
      case LRoomPacket.LeaveDown: {
        const channelId = inputBuffer.readInt32();
        console.log("Left channel", channelId);
        return;
      }
      case LRoomPacket.ListDown: {
        const channel = inputBuffer.readInt32();
        const guestsIds = inputBuffer.readArray((inputBuffer: VNetBuffer) => {
          return inputBuffer.readInt32();
        });
        console.log("List", "channel", channel, "->", "guestsIds", guestsIds);
        await writer.writeMessage((outputBuffer: VNetBuffer): void => {
          outputBuffer.writeInt32(LRoomPacket.InfoUp);
          outputBuffer.writeArray(
            guestsIds,
            (outputBuffer: VNetBuffer, guestId: number) => {
              outputBuffer.writeInt32(guestId);
            },
          );
        });
        return;
      }
      case LRoomPacket.BroadcastDown: {
        const senderId = inputBuffer.readInt32();
        const channelId = inputBuffer.readInt32();
        const message = inputBuffer.readString();
        console.log("broadcast received from", senderId, channelId, message);
        return;
      }
      case LRoomPacket.WhisperDown: {
        const senderId = inputBuffer.readInt32();
        const message = inputBuffer.readString();
        console.log("whisper received from", senderId, message);
        return;
      }
      case LRoomPacket.KeepaliveDown: {
        await writer.writeMessage((outputBuffer: VNetBuffer): void => {
          outputBuffer.writeInt32(LRoomPacket.KeepaliveUp);
          outputBuffer.writeInt32(inputBuffer.readInt32());
        });
        return;
      }
    }
    console.log("packet", packet);
    console.log("inputBuffer", inputBuffer);
  });
}

main();
