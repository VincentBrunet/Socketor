import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { LRoomUser } from "./LRoomUser.ts";

const usersByToken: VCoreMap<string, LRoomUser> = new VCoreMap<
  string,
  LRoomUser
>();
usersByToken.set("vincent", new LRoomUser("vinsininounet"));
usersByToken.set("maho", new LRoomUser("mahodesu"));

export class LRoomAuth {
  constructor() {
  }

  public getUser(token: string): LRoomUser | undefined {
    return usersByToken.get(token);
  }
}
