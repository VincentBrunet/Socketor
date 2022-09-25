import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomWriter } from "./LRoomWriter.ts";
import { LRoomData } from "./LRoomData.ts";
import { LRoomAuth } from "./LRoomAuth.ts";

export class LRoomReader {
  private _auth: LRoomAuth;
  private _data: LRoomData;
  private _writer: LRoomWriter;

  constructor(auth: LRoomAuth, data: LRoomData, writer: LRoomWriter) {
    this._auth = auth;
    this._data = data;
    this._writer = writer;
  }

  public readPacketInvalidUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): void {
    const code = buffer.readInt32();
    const message = buffer.readString();
    console.log(
      "Guest",
      sender.getId(),
      sender.getIdentity(),
      "is complaining about:",
      code,
      "->",
      message,
    );
  }

  public async readPacketAuthUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const token = buffer.readString();
    if (!token) {
      return await this._writer.writePacketInvalidDown(
        sender,
        403,
        "no auth token",
      );
    }
    const identity = this._auth.getIdentity(token);
    if (!identity) {
      return await this._writer.writePacketInvalidDown(
        sender,
        403,
        "invalid auth token: " + token,
      );
    }
    this._data.onGuestAuth(sender, identity);
    await this._writer.writePacketAuthDown(sender);
  }

  public async readPacketKickUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const receiverId = buffer.readInt32();
    const receiver = this._data.getGuest(receiverId);
    if (!receiver) {
      return await this._writer.writePacketInvalidDown(
        sender,
        404,
        "unknown kick receiver: " + receiverId,
      );
    }
    this._data.onGuestKick(sender, receiver);
    return await this._writer.writePacketKickDown(sender, receiver);
  }

  public async readPacketInfoUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const guestsUnfiltered = buffer.readArray((buffer) => {
      const guestId = buffer.readInt32();
      return this._data.getGuest(guestId);
    });
    const guestsFiltered = [];
    if (guestsUnfiltered) {
      for (const guestUnfiltered of guestsUnfiltered) {
        if (guestUnfiltered !== undefined) {
          guestsFiltered.push(guestUnfiltered);
        }
      }
    }
    return await this._writer.writePacketInfoDown(sender, guestsFiltered);
  }

  public async readPacketJoinUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const channelId = buffer.readInt32();
    const channel = this._data.getChannel(channelId);
    this._data.onGuestJoin(sender, channel);
    return await this._writer.writePacketJoinDown(sender, channel);
  }

  public async readPacketLeaveUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const channelId = buffer.readInt32();
    const channel = this._data.getChannel(channelId);
    this._data.onGuestLeave(sender, channel);
    return await this._writer.writePacketLeaveDown(sender, channel);
  }

  public async readPacketListUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const channelId = buffer.readInt32();
    const channel = this._data.getChannel(channelId);
    const guests = channel.listGuests();
    return await this._writer.writePacketListDown(sender, channel, guests);
  }

  public async readPacketBroadcastUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    const channelId = buffer.readInt32();
    const channel = this._data.getChannel(channelId);
    const guests = channel.listGuests();
    await this._writer.writePacketBroadcastDown(
      guests,
      sender,
      channel,
      buffer,
      bytes,
    );
  }

  public async readPacketWhisperUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    const receiverId = buffer.readInt32();
    const receiver = this._data.getGuest(receiverId);
    if (!receiver) {
      return await this._writer.writePacketInvalidDown(
        sender,
        404,
        "unknown whisper receiver: " + receiverId,
      );
    }
    await this._writer.writePacketWhisperDown(
      receiver,
      sender,
      buffer,
      bytes,
    );
  }

  public readPacketKeepaliveUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): void {
    const timestampMs = buffer.readInt32();
    this._data.onGuestAlive(sender, timestampMs);
  }
}
