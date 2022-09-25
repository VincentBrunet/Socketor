import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
import { LRoomChannel } from "./LRoomChannel.ts";
import { LRoomData } from "./LRoomData.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomPacket } from "./LRoomPacket.ts";

export class LRoomWriter {
  private _data: LRoomData;
  private _pool: VNetPool;

  constructor(data: LRoomData, pool: VNetPool) {
    this._data = data;
    this._pool = pool;
  }

  public async writePacketInvalidDown(
    receiver: LRoomGuest,
    code: number,
    message: string,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer): void => {
      buffer.writeInt32(LRoomPacket.InvalidDown);
      buffer.writeInt32(code);
      buffer.writeString(message);
    });
  }

  public async writePacketAuthDown(
    receiver: LRoomGuest,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.AuthDown);
      buffer.writeInt32(receiver.getId());
    });
  }

  public async writePacketKickDown(
    receiver: LRoomGuest,
    kicked: LRoomGuest,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.KickDown);
      buffer.writeInt32(kicked.getId());
    });
  }

  public async writePacketInfoDown(
    receiver: LRoomGuest,
    guests: LRoomGuest[],
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.InfoDown);
      buffer.writeArray(
        guests,
        (buffer: VNetBuffer, guest: LRoomGuest) => {
          buffer.writeInt32(guest.getId());
          buffer.writeInt32(guest.getAliveTimeMs() ?? -1);
          buffer.writeInt32(guest.getAlivePingMs() ?? -1);
          buffer.writeString(guest.getIdentity()?.getUsername());
          buffer.writeString(guest.getIdentity()?.getCapabilities());
        },
      );
    });
  }

  public async writePacketJoinDown(
    receiver: LRoomGuest,
    channel: LRoomChannel,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.JoinDown);
      buffer.writeInt32(channel.getId());
    });
  }

  public async writePacketLeaveDown(
    receiver: LRoomGuest,
    channel: LRoomChannel,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.LeaveDown);
      buffer.writeInt32(channel.getId());
    });
  }

  public async writePacketListDown(
    receiver: LRoomGuest,
    channel: LRoomChannel,
    guests: LRoomGuest[],
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer): void => {
      buffer.writeInt32(LRoomPacket.ListDown);
      buffer.writeInt32(channel.getId());
      buffer.writeInt32(guests.length);
      for (const guest of guests) {
        buffer.writeInt32(guest.getId());
      }
    });
  }

  public async writePacketBroadcastDown(
    receivers: LRoomGuest[],
    sender: LRoomGuest,
    channel: LRoomChannel,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    this.writePacketMemoryDown(
      receivers,
      buffer,
      bytes,
      (buffer: VNetBuffer) => {
        buffer.writeInt32(LRoomPacket.BroadcastDown);
        buffer.writeInt32(sender.getId());
        buffer.writeInt32(channel.getId());
      },
    );
    await Promise.resolve();
  }

  public async writePacketWhisperDown(
    receiver: LRoomGuest,
    sender: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    this.writePacketMemoryDown(
      [receiver],
      buffer,
      bytes,
      (buffer: VNetBuffer) => {
        buffer.writeInt32(LRoomPacket.WhisperDown);
        buffer.writeInt32(sender.getId());
      },
    );
    await Promise.resolve();
  }

  public async writePacketKeepaliveDown(
    receiver: LRoomGuest,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer): void => {
      buffer.writeInt32(LRoomPacket.KeepaliveDown);
      buffer.writeInt32(this._data.getUptimeMs());
    });
  }

  private async writePacketMemoryDown(
    receivers: LRoomGuest[],
    inputBuffer: VNetBuffer,
    bytes: number,
    header: (buffer: VNetBuffer) => void,
  ): Promise<void> {
    const inputPosition = inputBuffer.getPosition();
    const inputMemory = inputBuffer.getMemory(inputPosition, bytes);
    const fixedBuffer = this._pool.obtain();
    const fixedMemory = fixedBuffer.getMemory(0, inputMemory.length);
    fixedMemory.set(inputMemory);
    try {
      await Promise.allSettled(receivers.map(async (receiver: LRoomGuest) => {
        return await receiver.writeMessage((outputBuffer: VNetBuffer): void => {
          header(outputBuffer);
          const start = outputBuffer.getPosition();
          const end = start + fixedMemory.length;
          outputBuffer.setPosition(end);
          const outputMemory = outputBuffer.getMemory(start, end);
          outputMemory.set(fixedMemory);
        });
      }));
    } finally {
      this._pool.recycle(fixedBuffer);
    }
  }
}
