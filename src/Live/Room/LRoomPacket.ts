export enum LRoomPacket {
  Unknown = 0,

  InvalidUp = 1000,
  InvalidDown = 1001,

  AuthUp = 2010,
  AuthDown = 2011,
  StatusUp = 2020,
  StatusDown = 2021,

  ChannelJoinUp = 3030,
  ChannelJoinDown = 3031,
  ChannelExitUp = 3040,
  ChannelExitDown = 3041,

  BroadcastUp = 4050,
  BroadcastDown = 4051,
  WhisperUp = 4060,
  WhisperDown = 4061,

  KeepaliveUp = 5001,
  KeepaliveDown = 5002,
}
