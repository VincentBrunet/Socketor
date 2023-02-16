import { VCoreListSorted } from "../../Voyager/Core/VCoreListSorted.ts";
import { LRoomGuest } from "./LRoomGuest.ts";

export class LRoomChannel {
  private _id: number;
  private _guests: VCoreListSorted<LRoomGuest>;

  constructor(id: number) {
    this._id = id;
    this._guests = new VCoreListSorted<LRoomGuest>(LRoomChannel.rankingGuest);
  }

  public getId(): number {
    return this._id;
  }

  public addGuest(guest: LRoomGuest): void {
    if (!this._guests.containsValue(guest)) {
      this._guests.insertValue(guest);
    }
  }
  public removeGuest(guest: LRoomGuest): void {
    this._guests.removeValue(guest);
  }
  public listGuests(): LRoomGuest[] {
    return [...this._guests.getValues()];
  }

  private static rankingGuest(guest: LRoomGuest): number {
    return guest.getId();
  }
}
