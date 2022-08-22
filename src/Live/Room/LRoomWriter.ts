import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
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
    message: string,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer): void => {
      buffer.writeInt32(LRoomPacket.InvalidDown);
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

  public async writePacketStatusDown(
    receiver: LRoomGuest,
  ): Promise<void> {
    const guests = this._data.getGuests();
    await receiver.writeMessage((buffer: VNetBuffer): void => {
      buffer.writeInt32(LRoomPacket.StatusDown);
      buffer.writeInt32(guests.length);
      for (const guest of guests) {
        buffer.writeInt32(guest.getId());
        buffer.writeInt32(guest.getAliveTimeMs() ?? -1);
        buffer.writeInt32(guest.getAlivePingMs() ?? -1);
        buffer.writeString(guest.getUser()?.getUsername());
      }
    });
  }

  public async writePacketKickDown(
    receiver: LRoomGuest,
    kickedId: number,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.KickDown);
      buffer.writeInt32(kickedId);
    });
  }

  public async writePacketJoinDown(
    receiver: LRoomGuest,
    channelId: number,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.JoinDown);
      buffer.writeInt32(channelId);
    });
  }

  public async writePacketLeaveDown(
    receiver: LRoomGuest,
    channelId: number,
  ): Promise<void> {
    await receiver.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(LRoomPacket.LeaveDown);
      buffer.writeInt32(channelId);
    });
  }

  public async writePacketBroadcastDown(
    receivers: LRoomGuest[],
    sender: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    this.writePacketMemoryDown(
      LRoomPacket.BroadcastDown,
      receivers,
      sender,
      buffer,
      bytes,
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
      LRoomPacket.WhisperDown,
      [receiver],
      sender,
      buffer,
      bytes,
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
    packet: LRoomPacket,
    receivers: LRoomGuest[],
    sender: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    const inputPosition = buffer.getPosition();
    const inputMemory = buffer.getMemory(inputPosition, bytes);
    const fixedBuffer = this._pool.obtain();
    const fixedMemory = fixedBuffer.getMemory(0, inputMemory.length);
    fixedMemory.set(inputMemory);
    try {
      await Promise.allSettled(receivers.map(async (receiver: LRoomGuest) => {
        return await receiver.writeMessage((buffer: VNetBuffer): void => {
          buffer.writeInt32(packet);
          buffer.writeInt32(sender.getId());
          const start = buffer.getPosition();
          const end = start + fixedMemory.length;
          buffer.setPosition(end);
          const outputMemory = buffer.getMemory(start, end);
          outputMemory.set(fixedMemory);
        });
      }));
    } finally {
      this._pool.recycle(fixedBuffer);
    }
  }
}
