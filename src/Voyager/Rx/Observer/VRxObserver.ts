export interface VRxObserver<V> {
  onValue: (value: V) => void;
}
