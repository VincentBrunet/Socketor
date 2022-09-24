import { VCoreMap } from "../../Voyager/Core/VCoreMap.ts";
import { LRoomIdentity } from "./LRoomIdentity.ts";

const identityByToken: VCoreMap<string, LRoomIdentity> = new VCoreMap<
  string,
  LRoomIdentity
>();
identityByToken.set(
  "vincent",
  new LRoomIdentity(
    "vinsininounet",
    "is vinsininounet capabilities",
  ),
);
identityByToken.set(
  "maho",
  new LRoomIdentity(
    "mahodesu",
    "mahodesu capabilities",
  ),
);

export class LRoomAuth {
  constructor() {
  }
  public getIdentity(token: string): LRoomIdentity | undefined {
    return identityByToken.get(token);
  }
}
