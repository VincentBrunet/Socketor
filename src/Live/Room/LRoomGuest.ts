import { VCoreListSorted } from "../../Voyager/Core/VCoreListSorted.ts";
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
import { LRoomIdentity } from "./LRoomIdentity.ts";

export class LRoomGuest {
  private _connection: VNetConnection;
  private _pool: VNetPool;
  private _reader: VNetReader;
  private _writer: VNetWriter;
  private _aliveTimeMs?: number;
  private _alivePingMs?: number;
  private _identity?: LRoomIdentity;
  private _channels: VCoreListSorted<LRoomChannel>;
  private _kicks: VCoreListSorted<LRoomGuest>;

  public constructor(connection: VNetConnection, pool: VNetPool) {
    this._connection = connection;
    this._pool = pool;
    this._reader = new VNetReader(this._connection, this._pool);
    this._writer = new VNetWriter(this._connection, this._pool);
    this._aliveTimeMs = undefined;
    this._alivePingMs = undefined;
    this._identity = undefined;
    this._channels = new VCoreListSorted<LRoomChannel>(
      LRoomGuest.rankingChannel,
    );
    this._kicks = new VCoreListSorted<LRoomGuest>(LRoomGuest.rankingGuest);
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

  public setIdentity(identity: LRoomIdentity): void {
    this._identity = identity;
  }
  public getIdentity(): LRoomIdentity | undefined {
    return this._identity;
  }

  public addChannel(channel: LRoomChannel): void {
    if (!this._channels.containsValue(channel)) {
      this._channels.insertValue(channel);
    }
  }
  public removeChannel(channel: LRoomChannel): void {
    this._channels.removeValue(channel);
  }
  public listChannels(): LRoomChannel[] {
    return [...this._channels.getValues()];
  }

  public addKick(sender: LRoomGuest): void {
    if (!this._kicks.containsValue(sender)) {
      this._kicks.insertValue(sender);
    }
  }
  public removeKick(sender: LRoomGuest): void {
    this._kicks.removeValue(sender);
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

  private static rankingChannel(channel: LRoomChannel): number {
    return channel.getId();
  }
  private static rankingGuest(guest: LRoomGuest): number {
    return guest.getId();
  }
}
