import { VRxObserver } from "./VRxObserver.ts";

export type VRxObserverDelegateHandler<V> = (value: V) => void;

export class VRxObserverDelegate<V> implements VRxObserver<V> {
  private _handler: VRxObserverDelegateHandler<V>;
  public constructor(handler: VRxObserverDelegateHandler<V>) {
    this._handler = handler;
  }
  public onValue(value: V): void {
    this._handler(value);
  }
}
