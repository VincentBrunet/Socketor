import { VRxSubscription } from "./VRxSubscription.ts";

export type VRxSubscriptionDelegateHandler = () => void;

export class VRxSubscriptionDelegate implements VRxSubscription {
  private _handler?: VRxSubscriptionDelegateHandler;
  public constructor(handler: VRxSubscriptionDelegateHandler) {
    this._handler = handler;
  }
  public unsubscribe(): void {
    if (this._handler) {
      this._handler();
      this._handler = undefined;
    }
  }
}
