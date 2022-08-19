import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { VNetAddress } from "../../Voyager/Net/VNetAddress.ts";
import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { VNetConnection } from "../../Voyager/Net/VNetConnection.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
import { VNetServer } from "../../Voyager/Net/VNetServer.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomUser } from "./LRoomUser.ts";
import { LRoomPacket } from "./LRoomPacket.ts";

const usersByToken: VCoreMap<string, LRoomUser> = new VCoreMap<
  string,
  LRoomUser
>();
usersByToken.set("vincent", new LRoomUser("vinsininounet"));
usersByToken.set("maho", new LRoomUser("mahodesu"));

const origin = Date.now();

export class LRoomMain {
  private _address: VNetAddress;
  private _pool: VNetPool;
  private _cert: string;
  private _key: string;
  private _guests: VCoreMap<number, LRoomGuest>;

  public constructor(address: VNetAddress, cert: string, key: string) {
    this._address = address;
    this._pool = new VNetPool();
    this._cert = cert;
    this._key = key;
    this._guests = new VCoreMap<number, LRoomGuest>();
  }

  public async run(): Promise<void> {
    const server = new VNetServer({
      address: this._address,
      cert: this._cert,
      key: this._key,
    });
    await server.listen(async (connection: VNetConnection) => {
      const guest = new LRoomGuest(connection, this._pool);
      console.log("Guest connected", guest.getId());
      const periodic = setInterval(() => {
        try {
          guest.writeMessage((output: VNetBuffer): void => {
            output.writeInt32(LRoomPacket.Ping);
            output.writeInt32(this.getUptime());
          });
        } catch {
          console.log("Could not ping the guest", guest.getId());
        }
      }, 1000);
      try {
        await guest.readMessages(async (input: VNetBuffer) => {
          const packet = input.readInt32();
          switch (packet) {
            case LRoomPacket.AuthRequest:
              return await this.processPacketAuth(guest, input);
            case LRoomPacket.BroadcastRequest:
              return await this.processPacketBroadcast(guest, input);
            case LRoomPacket.WhisperRequest:
              return await this.processPacketWhisper(guest, input);
            case LRoomPacket.StatusRequest:
              return await this.processPacketStatus(guest);
            case LRoomPacket.Pong:
              return this.processPacketPong(guest, input);
          }
          return await this.processPacketInvalid(guest);
        });
      } catch {
        console.log("Guest disconnected", guest.getId());
      } finally {
        this._guests.remove(guest.getId());
        clearInterval(periodic);
      }
    });
  }

  public async processPacketAuth(
    sender: LRoomGuest,
    input: VNetBuffer,
  ): Promise<void> {
    const token = input.readString();
    if (!token) {
      return await this.processPacketInvalid(sender);
    }
    const user = usersByToken.get(token); // TODO(@vbrunet)
    if (!user) {
      return await this.processPacketInvalid(sender);
    }
    sender.setUser(user);
    this._guests.set(sender.getId(), sender);
    await sender.writeMessage((output: VNetBuffer) => {
      output.writeInt32(LRoomPacket.AuthPayload);
      output.writeInt32(sender.getId());
    });
  }

  public async processPacketBroadcast(
    sender: LRoomGuest,
    input: VNetBuffer,
  ): Promise<void> {
    if (!sender.getUser()) {
      return await this.processPacketInvalid(sender);
    }
    this.processPacketPayload(
      sender,
      [...this._guests.getValues()],
      input,
      LRoomPacket.BroadcastPayload,
    );
  }

  public async processPacketWhisper(
    sender: LRoomGuest,
    input: VNetBuffer,
  ): Promise<void> {
    if (!sender.getUser()) {
      return await this.processPacketInvalid(sender);
    }
    const receiver = this._guests.get(input.readInt32());
    if (!receiver) {
      return await this.processPacketInvalid(sender);
    }
    this.processPacketPayload(
      sender,
      [receiver],
      input,
      LRoomPacket.WhisperPayload,
    );
  }

  public async processPacketStatus(
    sender: LRoomGuest,
  ): Promise<void> {
    await sender.writeMessage((buffer: VNetBuffer): void => {
      buffer.writeInt32(LRoomPacket.StatusPayload);
      buffer.writeInt32(this._guests.getCount());
      for (const guest of this._guests.getValues()) {
        buffer.writeInt32(guest.getId());
        buffer.writeInt32(guest.getLag() ?? -1);
        buffer.writeString(guest.getUser()?.getUsername());
      }
    });
  }

  public processPacketPong(
    sender: LRoomGuest,
    input: VNetBuffer,
  ): void {
    const timestamp = input.readInt32();
    const delay = this.getUptime() - timestamp;
    sender.setLag(delay / 2);
  }

  public async processPacketInvalid(
    sender: LRoomGuest,
  ): Promise<void> {
    await sender.writeMessage((buffer: VNetBuffer): void => {
      console.log("Packet invalid sent", sender.getId());
      buffer.writeInt32(LRoomPacket.Invalid);
    });
  }

  public async processPacketPayload(
    sender: LRoomGuest,
    receivers: LRoomGuest[],
    input: VNetBuffer,
    packet: LRoomPacket,
  ): Promise<void> {
    const start = input.getIndexReader();
    const end = input.getIndexWriter();
    const memory = input.getMemory(start, end);
    const fixedBuffer = this._pool.obtain(memory.length);
    const fixedMemory = fixedBuffer.getMemory(0, memory.length);
    fixedMemory.set(memory);
    try {
      await Promise.all(receivers.map((receiver: LRoomGuest) => {
        return receiver.writeMessage((output: VNetBuffer): void => {
          output.writeInt32(packet);
          output.writeInt32(sender.getId());
          output.writeArray(fixedMemory);
        });
      }));
    } finally {
      this._pool.recycle(fixedBuffer);
    }
  }

  public getUptime(): number {
    return Date.now() - origin;
  }
}
