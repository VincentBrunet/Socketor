import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomUser } from "./LRoomUser.ts";

export class LRoomData {
  private _startTime: number;
  private _guests: VCoreMap<number, LRoomGuest>;

  constructor() {
    this._startTime = Date.now();
    this._guests = new VCoreMap<number, LRoomGuest>();
  }

  public getUptimeMs(): number {
    return Date.now() - this._startTime;
  }

  public initGuest(guest: LRoomGuest): void {
    guest.setAliveTimeMs(this.getUptimeMs());
  }

  public aliveGuest(guest: LRoomGuest, timestampMs: number): void {
    const roundtripMs = this.getUptimeMs() - timestampMs;
    guest.setAliveTimeMs(timestampMs);
    guest.setAlivePingMs(roundtripMs);
  }

  public checkGuest(guest: LRoomGuest): boolean {
    const aliveTimeMs = guest.getAliveTimeMs();
    if (!aliveTimeMs) {
      return false;
    }
    return aliveTimeMs > (this.getUptimeMs() - 5000);
  }

  public kickGuest(_guest: LRoomGuest, _kickedId: number): void {
    // TODO(@vbrunet)
  }

  public joinGuest(_guest: LRoomGuest, _channelId: number): void {
    // TODO(@vbrunet)
  }

  public leaveGuest(_guest: LRoomGuest, _channelId: number): void {
    // TODO(@vbrunet)
  }

  public addGuest(guest: LRoomGuest, user: LRoomUser): void {
    guest.setUser(user);
    this._guests.set(guest.getId(), guest);
  }

  public getGuests(_channelId?: number): LRoomGuest[] {
    // TODO(@vbrunet)
    return [...this._guests.getValues()];
  }

  public getGuest(id: number): LRoomGuest | undefined {
    return this._guests.get(id);
  }

  public removeGuest(guest: LRoomGuest): void {
    this._guests.remove(guest.getId());
  }
}
