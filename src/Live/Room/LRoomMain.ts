import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { VNetAddress } from "../../Voyager/Net/VNetAddress.ts";
import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { VNetConnection } from "../../Voyager/Net/VNetConnection.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
import { VNetServer } from "../../Voyager/Net/VNetServer.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomUser } from "./LRoomUser.ts";
import { VNetWriterSerializer } from "../../Voyager/Net/VNetWriter.ts";

const usersByToken: VCoreMap<string, LRoomUser> = new VCoreMap<
  string,
  LRoomUser
>();
usersByToken.set("vincent", new LRoomUser("vinsininounet"));
usersByToken.set("maho", new LRoomUser("mahodesu"));

export class LRoomMain {
  private _address: VNetAddress;
  private _pool: VNetPool;
  private _cert: string;
  private _key: string;

  public constructor(address: VNetAddress, cert: string, key: string) {
    this._address = address;
    this._pool = new VNetPool();
    this._cert = cert;
    this._key = key;
  }

  public async run(): Promise<void> {
    const server = new VNetServer({
      address: this._address,
      cert: this._cert,
      key: this._key,
    });
    await server.listen(async (connection: VNetConnection) => {
      const guest = new LRoomGuest(connection, this._pool);
      try {
        await guest.readMessages(async (buffer: VNetBuffer) => {
          switch (buffer.readInt32()) {
            case 0:
              return await this.processPacketAuth(guest, buffer);
            case 1:
              return await this.processPacketBroadcast(guest, buffer);
            case 2:
              return await this.processPacketPrivate(guest, buffer);
          }
          return await this.processPacketInvalid(guest, buffer);
        });
      } catch (error) {
        console.log("Error with guest", guest.getId(), error);
      }
    });
  }

  public async processPacketAuth(
    guest: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
    const token = buffer.readString();
    if (!token) {
      return await this.processPacketInvalid();
    }
    const user = usersByToken.get(token); // TODO
    if (!user) {
      return await this.processPacketInvalid();
    }
    guest.setUser(user);
    await guest.writeMessage((buffer: VNetBuffer) => {
      buffer.writeInt32(42); // Auth success
    });
  }

  public async processPacketBroadcast(
    guest: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
  }

  public async processPacketPrivate(
    guest: LRoomGuest,
    buffer: VNetBuffer,
  ): Promise<void> {
  }

  public async processPacketInvalid(
    guest: LRoomGuest,
    serializer?: VNetWriterSerializer,
  ): Promise<void> {
    await guest.writeMessage(async (buffer: VNetBuffer) => {
      await buffer.writeInt32(42);
    });
  }
}
