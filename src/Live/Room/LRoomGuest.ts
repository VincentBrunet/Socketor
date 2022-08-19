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
  private _lag?: number;
  private _user?: LRoomUser;

  public constructor(connection: VNetConnection, pool: VNetPool) {
    this._connection = connection;
    this._pool = pool;
    this._reader = new VNetReader(this._connection, this._pool);
    this._writer = new VNetWriter(this._connection, this._pool);
    this._lag = undefined;
    this._user = undefined;
  }

  public getId(): number {
    return this._connection.getId();
  }

  public setLag(lag: number): void {
    this._lag = lag;
  }
  public getLag(): number | undefined {
    return this._lag;
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
}
