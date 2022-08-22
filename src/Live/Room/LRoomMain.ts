import { VNetAddress } from "../../Voyager/Net/VNetAddress.ts";
import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { VNetConnection } from "../../Voyager/Net/VNetConnection.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
import { VNetServer } from "../../Voyager/Net/VNetServer.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomPacket } from "./LRoomPacket.ts";
import { LRoomLogger } from "./LRoomLogger.ts";
import { LRoomReader } from "./LRoomReader.ts";
import { LRoomWriter } from "./LRoomWriter.ts";
import { LRoomData } from "./LRoomData.ts";
import { LRoomAuth } from "./LRoomAuth.ts";

export class LRoomMain {
  private _address: VNetAddress;
  private _cert: string;
  private _key: string;
  private _pool: VNetPool;
  private _logger: LRoomLogger;
  private _auth: LRoomAuth;
  private _data: LRoomData;
  private _writer: LRoomWriter;
  private _reader: LRoomReader;

  public constructor(address: VNetAddress, cert: string, key: string) {
    this._address = address;
    this._cert = cert;
    this._key = key;
    this._pool = new VNetPool();
    this._logger = new LRoomLogger();
    this._auth = new LRoomAuth();
    this._data = new LRoomData();
    this._writer = new LRoomWriter(this._data, this._pool);
    this._reader = new LRoomReader(this._auth, this._data, this._writer);
  }

  public async listen(): Promise<void> {
    const server = new VNetServer({
      address: this._address,
      cert: this._cert,
      key: this._key,
    });
    await server.listen(async (connection: VNetConnection) => {
      const guest = new LRoomGuest(connection, this._pool);
      this._logger.logConnected(guest);
      this._data.initGuest(guest);
      const keepaliveInterval = setInterval(async () => {
        try {
          if (this._data.checkGuest(guest)) {
            await this._writer.writePacketKeepaliveDown(guest);
          } else {
            throw new Error("Guest is lagging behind too much");
          }
        } catch (error) {
          this._logger.logPingFail(guest, error);
          guest.close();
        }
      }, 1000);
      try {
        await this.readMessages(guest);
      } catch (error) {
        this._logger.logDisconnected(guest, error);
      } finally {
        this._data.removeGuest(guest);
        clearInterval(keepaliveInterval);
        guest.close();
      }
    });
  }

  private async readMessages(guest: LRoomGuest): Promise<void> {
    await guest.readMessages(
      async (buffer: VNetBuffer, bytes: number) => {
        await this.readMessage(guest, buffer, bytes);
      },
    );
  }

  private async readMessage(
    guest: LRoomGuest,
    buffer: VNetBuffer,
    bytes: number,
  ): Promise<void> {
    const packet = buffer.readInt32();
    if (!guest.getUser() && packet !== LRoomPacket.AuthUp) {
      throw Error("Unauthorized packet:" + packet);
    }
    switch (packet) {
      case LRoomPacket.AuthUp: {
        return await this._reader.readPacketAuthUp(guest, buffer);
      }
      case LRoomPacket.StatusUp: {
        return await this._reader.readPacketStatusUp(guest);
      }
      case LRoomPacket.BroadcastUp: {
        return await this._reader.readPacketBroadcastUp(guest, buffer, bytes);
      }
      case LRoomPacket.WhisperUp: {
        return await this._reader.readPacketWhisperUp(guest, buffer, bytes);
      }
      case LRoomPacket.KeepaliveUp: {
        return this._reader.readPacketKeepaliveUp(guest, buffer);
      }
    }
    throw Error("Unknown packet:" + packet);
  }
}
