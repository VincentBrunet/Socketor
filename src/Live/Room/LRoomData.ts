import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { LRoomChannel } from "./LRoomChannel.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomIdentity } from "./LRoomIdentity.ts";

export class LRoomData {
  private _startTime: number;
  private _guests: VCoreMap<number, LRoomGuest>;
  private _channels: VCoreMap<number, LRoomChannel>;

  constructor() {
    this._startTime = Date.now();
    this._guests = new VCoreMap<number, LRoomGuest>();
    this._channels = new VCoreMap<number, LRoomChannel>();
  }

  public onGuestConnect(guest: LRoomGuest): void {
    guest.setAliveTimeMs(this.getUptimeMs());
  }

  public onGuestAlive(guest: LRoomGuest, timestampMs: number): void {
    const roundtripMs = this.getUptimeMs() - timestampMs;
    guest.setAliveTimeMs(timestampMs);
    guest.setAlivePingMs(roundtripMs);
  }

  public onGuestAuth(guest: LRoomGuest, identity: LRoomIdentity): void {
    guest.setIdentity(identity);
    this._guests.set(guest.getId(), guest);
  }

  public onGuestKick(guest: LRoomGuest, receiver: LRoomGuest): void {
    guest.addKick(receiver);
  }

  public onGuestJoin(guest: LRoomGuest, channel: LRoomChannel): void {
    guest.addChannel(channel);
    channel.addGuest(guest);
  }

  public onGuestLeave(guest: LRoomGuest, channel: LRoomChannel): void {
    guest.removeChannel(channel);
    channel.removeGuest(guest);
  }

  public onGuestDisconnect(guest: LRoomGuest): void {
    const channels = guest.listChannels();
    for (const channel of channels) {
      this.onGuestLeave(guest, channel);
    }
    this._guests.remove(guest.getId());
  }

  public getGuest(guestId: number): LRoomGuest | undefined {
    return this._guests.get(guestId);
  }

  public getChannel(channelId: number): LRoomChannel {
    let channel = this._channels.get(channelId);
    if (!channel) {
      channel = new LRoomChannel(channelId);
      this._channels.set(channelId, channel);
    }
    return channel;
  }

  public checkGuest(guest: LRoomGuest): boolean {
    const aliveTimeMs = guest.getAliveTimeMs();
    if (!aliveTimeMs) {
      return false;
    }
    const aliveRecently = aliveTimeMs > (this.getUptimeMs() - 5000);
    if (!aliveRecently) {
      return false;
    }
    const kicks = guest.listKicks();
    let validKicks = 0;
    for (const kick of kicks) {
      if (this.getGuest(kick.getId())) {
        validKicks++;
      } else {
        guest.removeKick(kick);
      }
    }
    const enoughKicks = validKicks > this._guests.getCount() / 2;
    if (enoughKicks) {
      return false;
    }
    return true;
  }

  public getUptimeMs(): number {
    return Date.now() - this._startTime;
  }
}
