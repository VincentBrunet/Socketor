import { VRxSubscription } from "./VRxSubscription.ts";

export type VRxSubscriptionDelegateHandler = () => void;

export class VRxSubscriptionDelegate implements VRxSubscription {
  private _handler?: VRxSubscriptionDelegateHandler;
  constructor(handler: VRxSubscriptionDelegateHandler) {
    this._handler = handler;
  }
  unsubscribe(): void {
    if (this._handler) {
      this._handler();
      this._handler = undefined;
    }
  }
}
