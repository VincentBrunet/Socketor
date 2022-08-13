import { VRxObserver } from "../Observer/VRxObserver.ts";
import { VRxSubscription } from "../Subscription/VRxSubscription.ts";
import { VRxSubscriptionDelegate } from "../Subscription/VRxSubscriptionDelegate.ts";
import { VRxSubject } from "../VRxSubject.ts";
import { VRxObservable } from "./VRxObservable.ts";

export type VRxObservableDelegateHandler<V> = (
  observer: VRxObserver<V>,
) => (() => void);

export class VRxObservableDelegate<V> implements VRxObservable<V> {
  private _handler: VRxObservableDelegateHandler<V>;
  constructor(handler: VRxObservableDelegateHandler<V>) {
    this._handler = handler;
  }
  subscribe(observer: VRxObserver<V>): VRxSubscription {
    const subject = new VRxSubject<V>();
    const subscription = subject.subscribe(observer);
    const teardown = this._handler(subject);
    return new VRxSubscriptionDelegate(() => {
      teardown();
      subscription.unsubscribe();
    });
  }
}
