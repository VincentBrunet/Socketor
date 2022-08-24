import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { VNetConnection } from "../../Voyager/Net/VNetConnection.ts";
import { VNetPool } from "../../Voyager/Net/VNetPool.ts";
import {
  VNetReader,
  VNetReaderDeserializer,
} from "../../Voyager/Net/VNetReader.ts";
import {
  VNetWriter,
  VNetWriterSerializer,
} from "../../Voyager/Net/VNetWriter.ts";
import { LRoomChannel } from "./LRoomChannel.ts";
import { LRoomUser } from "./LRoomUser.ts";

export class LRoomGuest {
  private _connection: VNetConnection;
  private _pool: VNetPool;
  private _reader: VNetReader;
  private _writer: VNetWriter;
  private _aliveTimeMs?: number;
  private _alivePingMs?: number;
  private _user?: LRoomUser;
  private _channels: VCoreMap<number, LRoomChannel>;
  private _kicks: VCoreMap<number, LRoomGuest>;

  public constructor(connection: VNetConnection, pool: VNetPool) {
    this._connection = connection;
    this._pool = pool;
    this._reader = new VNetReader(this._connection, this._pool);
    this._writer = new VNetWriter(this._connection, this._pool);
    this._aliveTimeMs = undefined;
    this._alivePingMs = undefined;
    this._user = undefined;
    this._channels = new VCoreMap<number, LRoomChannel>();
    this._kicks = new VCoreMap<number, LRoomGuest>();
  }

  public getId(): number {
    return this._connection.getId();
  }

  public setAliveTimeMs(aliveTimeMs: number): void {
    this._aliveTimeMs = aliveTimeMs;
  }
  public setAlivePingMs(alivePingMs: number): void {
    this._alivePingMs = alivePingMs;
  }

  public getAliveTimeMs(): number | undefined {
    return this._aliveTimeMs;
  }
  public getAlivePingMs(): number | undefined {
    return this._alivePingMs;
  }

  public setUser(user: LRoomUser): void {
    this._user = user;
  }
  public getUser(): LRoomUser | undefined {
    return this._user;
  }

  public addChannel(channel: LRoomChannel): void {
    this._channels.set(channel.getId(), channel);
  }
  public removeChannel(channel: LRoomChannel): void {
    this._channels.remove(channel.getId());
  }
  public listChannels(): LRoomChannel[] {
    return [...this._channels.getValues()];
  }

  public addKick(sender: LRoomGuest): void {
    this._kicks.set(sender.getId(), sender);
  }
  public removeKick(sender: LRoomGuest): void {
    this._kicks.remove(sender.getId());
  }
  public listKicks(): LRoomGuest[] {
    return [...this._kicks.getValues()];
  }

  public async readMessages(
    deserializer: VNetReaderDeserializer,
  ): Promise<void> {
    return await this._reader.readMessages(deserializer);
  }
  public async writeMessage(
    serializer: VNetWriterSerializer,
  ): Promise<void> {
    return await this._writer.writeMessage(serializer);
  }

  public close(): void {
    return this._connection.close();
  }
}
