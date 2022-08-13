import { VRxObserver } from "../Observer/VRxObserver.ts";
import { VRxSubscription } from "../Subscription/VRxSubscription.ts";

export interface VRxObservable<V> {
  subscribe: (observer: VRxObserver<V>) => VRxSubscription;
}
