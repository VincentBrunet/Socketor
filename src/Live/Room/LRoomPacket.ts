export enum LRoomPacket {
  Unknown = 0,

  InvalidUp = 1000,
  InvalidDown = 1001,

  AuthUp = 2010,
  AuthDown = 2011,
  KickUp = 2030,
  KickDown = 2031,
  InfoUp = 2040,
  InfoDown = 2041,

  JoinUp = 3030,
  JoinDown = 3031,
  LeaveUp = 3040,
  LeaveDown = 3041,
  ListUp = 3050,
  ListDown = 3051,

  BroadcastUp = 4050,
  BroadcastDown = 4051,
  WhisperUp = 4060,
  WhisperDown = 4061,

  KeepaliveUp = 5001,
  KeepaliveDown = 5002,
}
