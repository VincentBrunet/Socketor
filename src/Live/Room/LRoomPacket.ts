export enum LRoomPacket {
  Unknown = 0,
  Invalid = 1,
  AuthRequest = 2,
  AuthPayload = 3,
  BroadcastRequest = 4,
  BroadcastPayload = 5,
  WhisperRequest = 6,
  WhisperPayload = 7,
  StatusRequest = 8,
  StatusPayload = 9,
  Ping = 10,
  Pong = 11,
}
