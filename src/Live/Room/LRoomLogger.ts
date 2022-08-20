import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomUser } from "./LRoomUser.ts";

export class LRoomLogger {
  logConnected(guest: LRoomGuest): void {
    console.log("Guest", guest.getId(), "connected");
  }
  logDisconnected(guest: LRoomGuest, error: Error): void {
    console.log("Guest", guest.getId(), "exit", error);
  }
  logAuthenticated(guest: LRoomGuest, user: LRoomUser): void {
    console.log("Guest", guest.getId(), "authenticated:", user.getUsername());
  }
  logPacketInvalid(guest: LRoomGuest, message: string): void {
    console.log("Guest", guest.getId(), "message:", message);
  }
  logPingFail(guest: LRoomGuest, _error: Error): void {
    console.log("Guest", guest.getId(), "ping fail");
  }
}
