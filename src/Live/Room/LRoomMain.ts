import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { VNetAddress } from "../../Voyager/Net/VNetAddress.ts";
import { VNetBuffer } from "../../Voyager/Net/VNetBuffer.ts";
import { VNetConnection } from "../../Voyager/Net/VNetConnection.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
import { VNetServer } from "../../Voyager/Net/VNetServer.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomUser } from "./LRoomUser.ts";
import { LRoomPacket } from "./LRoomPacket.ts";
import { LRoomLogger } from "./LRoomLogger.ts";

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
  private _logger: LRoomLogger;

  public constructor(address: VNetAddress, cert: string, key: string) {
    this._address = address;
    this._pool = new VNetPool();
    this._cert = cert;
    this._key = key;
    this._guests = new VCoreMap<number, LRoomGuest>();
    this._logger = new LRoomLogger();
  }

  public async run(): Promise<void> {
    const server = new VNetServer({
      address: this._address,
      cert: this._cert,
      key: this._key,
    });
    await server.listen(async (connection: VNetConnection) => {
      const guest = new LRoomGuest(connection, this._pool);
      guest.setAliveTime(this.getUptime());
      this._logger.logConnected(guest);
      const periodic = setInterval(() => {
        try {
          guest.writeMessage((outputBuffer: VNetBuffer): void => {
            outputBuffer.writeInt32(LRoomPacket.Ping);
            outputBuffer.writeInt32(this.getUptime());
          });
        } catch (error) {
          this._logger.logPingFail(guest, error);
        }
      }, 1000);
      try {
        await guest.readMessages(async (inputBuffer: VNetBuffer) => {
          const packet = inputBuffer.readInt32();
          if (!guest.getUser()) {
            if (LRoomPacket.AuthRequest) {
              return await this.processPacketAuth(guest, inputBuffer);
            } else {
              return await this.processPacketInvalid(guest, "unauthorized");
            }
          }
          switch (packet) {
            case LRoomPacket.BroadcastRequest:
              return await this.processPacketBroadcast(guest, inputBuffer);
            case LRoomPacket.WhisperRequest:
              return await this.processPacketWhisper(guest, inputBuffer);
            case LRoomPacket.StatusRequest:
              return await this.processPacketStatus(guest);
            case LRoomPacket.Pong:
              return this.processPacketPong(guest, inputBuffer);
          }
          return await this.processPacketInvalid(guest, "unknown packet");
        });
      } catch (error) {
        this._logger.logDisconnected(guest, error);
      } finally {
        this._guests.remove(guest.getId());
        clearInterval(periodic);
        guest.close();
      }
    });
  }

  public async processPacketAuth(
    sender: LRoomGuest,
    inputBuffer: VNetBuffer,
  ): Promise<void> {
    const token = inputBuffer.readString();
    if (!token) {
      return await this.processPacketInvalid(sender, "no token");
    }
    const user = usersByToken.get(token); // TODO(@vbrunet)
    if (!user) {
      return await this.processPacketInvalid(sender, "invalid token: " + token);
    }
    sender.setUser(user);
    this._guests.set(sender.getId(), sender);
    this._logger.logAuthenticated(sender, user);
    await sender.writeMessage((outputBuffer: VNetBuffer) => {
      outputBuffer.writeInt32(LRoomPacket.AuthPayload);
      outputBuffer.writeInt32(sender.getId());
    });
  }

  public async processPacketBroadcast(
    sender: LRoomGuest,
    inputBuffer: VNetBuffer,
  ): Promise<void> {
    if (!sender.getUser()) {
      return await this.processPacketInvalid(sender, "unauthorized");
    }
    this.processPacketPayload(
      sender,
      [...this._guests.getValues()],
      inputBuffer,
      LRoomPacket.BroadcastPayload,
    );
  }

  public async processPacketWhisper(
    sender: LRoomGuest,
    inputBuffer: VNetBuffer,
  ): Promise<void> {
    if (!sender.getUser()) {
      return await this.processPacketInvalid(sender, "unauthorized");
    }
    const receiver = this._guests.get(inputBuffer.readInt32());
    if (!receiver) {
      return await this.processPacketInvalid(sender, "unknown user");
    }
    this.processPacketPayload(
      sender,
      [receiver],
      inputBuffer,
      LRoomPacket.WhisperPayload,
    );
  }

  public async processPacketStatus(
    sender: LRoomGuest,
  ): Promise<void> {
    await sender.writeMessage((outputBuffer: VNetBuffer): void => {
      outputBuffer.writeInt32(LRoomPacket.StatusPayload);
      outputBuffer.writeInt32(this._guests.getCount());
      for (const guest of this._guests.getValues()) {
        outputBuffer.writeInt32(guest.getId());
        outputBuffer.writeInt32(guest.getAliveTime() ?? -1);
        outputBuffer.writeInt32(guest.getAlivePing() ?? -1);
        outputBuffer.writeString(guest.getUser()?.getUsername());
      }
    });
  }

  public processPacketPong(
    sender: LRoomGuest,
    inputBuffer: VNetBuffer,
  ): void {
    const timestamp = inputBuffer.readInt32();
    const roundtrip = this.getUptime() - timestamp;
    sender.setAliveTime(timestamp);
    sender.setAlivePing(roundtrip);
  }

  public async processPacketInvalid(
    sender: LRoomGuest,
    message: string,
  ): Promise<void> {
    this._logger.logPacketInvalid(sender, message);
    await sender.writeMessage((outputBuffer: VNetBuffer): void => {
      outputBuffer.writeInt32(LRoomPacket.Invalid);
      outputBuffer.writeString(message);
    });
  }

  public async processPacketPayload(
    sender: LRoomGuest,
    receivers: LRoomGuest[],
    inputBuffer: VNetBuffer,
    packet: LRoomPacket,
  ): Promise<void> {
    const inputMemory = inputBuffer.readMemory();
    if (!inputMemory) {
      return await this.processPacketInvalid(sender, "no payload");
    }
    const fixedBuffer = this._pool.obtain();
    fixedBuffer.writeMemory(inputMemory);
    const fixedMemory = fixedBuffer.readMemory();
    try {
      await Promise.all(receivers.map((receiver: LRoomGuest) => {
        return receiver.writeMessage((outputBuffer: VNetBuffer): void => {
          outputBuffer.writeInt32(packet);
          outputBuffer.writeInt32(sender.getId());
          outputBuffer.writeMemory(fixedMemory);
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
