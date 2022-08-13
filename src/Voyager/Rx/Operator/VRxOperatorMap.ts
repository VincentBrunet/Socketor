import { VRxObservable } from "../Observable/VRxObservable.ts";
import { VRxObserver } from "../Observer/VRxObserver.ts";
import { VRxObserverDelegate } from "../Observer/VRxObserverDelegate.ts";
import { VRxSubscription } from "../Subscription/VRxSubscription.ts";

export type VRxOperatorMapHandler<Input, Output> = (input: Input) => Output;

export class VRxOperatorMapObservable<Input, Output>
  implements VRxObservable<Output> {
  private _observable: VRxObservable<Input>;
  private _handler: VRxOperatorMapHandler<Input, Output>;
  constructor(
    observable: VRxObservable<Input>,
    handler: VRxOperatorMapHandler<Input, Output>,
  ) {
    this._observable = observable;
    this._handler = handler;
  }
  subscribe(observer: VRxObserver<Output>): VRxSubscription {
    return this._observable.subscribe(
      new VRxObserverDelegate((input: Input): void => {
        observer.onValue(this._handler(input));
      }),
    );
  }
}

export class VRxOperatorMapObserver<Input, Output>
  implements VRxObserver<Input> {
  private _observer: VRxObserver<Output>;
  private _handler: VRxOperatorMapHandler<Input, Output>;
  constructor(
    observer: VRxObserver<Output>,
    handler: VRxOperatorMapHandler<Input, Output>,
  ) {
    this._observer = observer;
    this._handler = handler;
  }
  onValue(value: Input): void {
    this._observer.onValue(this._handler(value));
  }
}

export function observableMap<Input, Output>(
  handler: VRxOperatorMapHandler<Input, Output>,
): (observable: VRxObservable<Input>) => VRxObservable<Output> {
  return (observable: VRxObservable<Input>) => {
    return new VRxOperatorMapObservable(observable, handler);
  };
}

export function observerMap<Input, Output>(
  handler: VRxOperatorMapHandler<Input, Output>,
): (observer: VRxObserver<Output>) => VRxObserver<Input> {
  return (observer: VRxObserver<Output>) => {
    return new VRxOperatorMapObserver(observer, handler);
  };
}
