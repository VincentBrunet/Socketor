import { LRoomGuest } from "./LRoomGuest.ts";
import { LRoomIdentity } from "./LRoomIdentity.ts";

export class LRoomLogger {
  logConnected(guest: LRoomGuest): void {
    console.log("Guest", guest.getId(), "connected");
  }
  logDisconnected(guest: LRoomGuest, error: Error): void {
    console.log("Guest", guest.getId(), "exit", error.message);
  }
  logAuthenticated(guest: LRoomGuest, identity: LRoomIdentity): void {
    console.log(
      "Guest",
      guest.getId(),
      "authenticated:",
      identity.getUsername(),
      identity.getCapabilities(),
    );
  }
  logPacketInvalid(guest: LRoomGuest, message: string): void {
    console.log("Guest", guest.getId(), "message:", message);
  }
  logPingFail(guest: LRoomGuest, _error: Error): void {
    console.log("Guest", guest.getId(), "ping fail");
  }
}
