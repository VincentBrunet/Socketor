import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { LRoomGuest } from "./LRoomGuest.ts";

export class LRoomChannel {
  private _id: number;
  private _guests: VCoreMap<number, LRoomGuest>;

  constructor(id: number) {
    this._id = id;
    this._guests = new VCoreMap<number, LRoomGuest>();
  }

  public getId(): number {
    return this._id;
  }

  public addGuest(guest: LRoomGuest): void {
    this._guests.set(guest.getId(), guest);
  }
  public removeGuest(guest: LRoomGuest): void {
    this._guests.remove(guest.getId());
  }
  public listGuests(): LRoomGuest[] {
    return [...this._guests.getValues()];
  }
}
