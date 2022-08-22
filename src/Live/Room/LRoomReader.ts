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

  public async readPacketAuthUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const token = buffer.readString();
    if (!token) {
      return await this._writer.writePacketInvalidDown(
        sender,
        "no auth token",
      );
    }
    const user = this._auth.getUser(token);
    if (!user) {
      return await this._writer.writePacketInvalidDown(
        sender,
        "invalid auth token: " + token,
      );
    }
    this._data.addGuest(sender, user);
    await this._writer.writePacketAuthDown(sender);
  }

  public async readPacketStatusUp(
    sender: LRoomGuest,
  ): Promise<void> {
    return await this._writer.writePacketStatusDown(sender);
  }

  public async readPacketKickUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const kickedId = buffer.readInt32();
    //return await this._writer.writePacketStatusDown(sender);
    return await this._writer.writePacketKickDown(sender, kickedId);
  }
  public async readPacketJoinUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const channelId = buffer.readInt32();
    return await this._writer.writePacketJoinDown(sender, channelId);
  }
  public async readPacketLeaveUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const channelId = buffer.readInt32();
    return await this._writer.writePacketLeaveDown(sender, channelId);
  }

  public async readPacketBroadcastUp(
    sender: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    const guests = this._data.getGuests();
    await this._writer.writePacketBroadcastDown(
      guests,
      sender,
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
    this._data.aliveGuest(sender, timestampMs);
  }
}
