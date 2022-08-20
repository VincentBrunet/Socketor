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
import { LRoomUser } from "./LRoomUser.ts";

export class LRoomGuest {
  private _connection: VNetConnection;
  private _pool: VNetPool;
  private _reader: VNetReader;
  private _writer: VNetWriter;
  private _aliveTime?: number;
  private _alivePing?: number;
  private _user?: LRoomUser;

  public constructor(connection: VNetConnection, pool: VNetPool) {
    this._connection = connection;
    this._pool = pool;
    this._reader = new VNetReader(this._connection, this._pool);
    this._writer = new VNetWriter(this._connection, this._pool);
    this._aliveTime = undefined;
    this._alivePing = undefined;
    this._user = undefined;
  }

  public getId(): number {
    return this._connection.getId();
  }

  public setAliveTime(time: number): void {
    this._aliveTime = time;
  }
  public setAlivePing(ping: number): void {
    this._alivePing = ping;
  }

  public getAliveTime(): number | undefined {
    return this._aliveTime;
  }
  public getAlivePing(): number | undefined {
    return this._alivePing;
  }

  public setUser(user: LRoomUser): void {
    this._user = user;
  }
  public getUser(): LRoomUser | undefined {
    return this._user;
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
