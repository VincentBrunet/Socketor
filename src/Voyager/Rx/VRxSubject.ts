import { VCoreList } from "../Core/VCoreList.ts";
import { VRxObservable } from "./Observable/VRxObservable.ts";
import { VRxObserver } from "./Observer/VRxObserver.ts";
import { VRxSubscription } from "./Subscription/VRxSubscription.ts";

export class VRxSubject<V> implements VRxObservable<V>, VRxObserver<V> {
  private _observers: VCoreList<VRxObserver<V>>;
  public constructor() {
    this._observers = new VCoreList<VRxObserver<V>>();
  }
  public subscribe(observer: VRxObserver<V>): VRxSubscription {
    this._observers.add(observer);
    return {
      unsubscribe: () => {
        this._observers.remove(observer);
      },
    };
  }
  public onValue(value: V): void {
    for (const observer of this._observers) {
      observer.onValue(value);
    }
  }
}
