import { VFsFile } from "./src/Voyager/Fs/VFsFile.ts";
import { VNetAddress } from "./src/Voyager/Net/VNetAddress.ts";
import { LRoomMain } from "./src/Live/Room/LRoomMain.ts";

const certFile = new VFsFile("./cert/socketor.host.crt");
const keyFile = new VFsFile("./cert/socketor.host.key");

const cert = await certFile.readText();
const key = await keyFile.readText();

const address = new VNetAddress("127.0.0.1", 10000, false);

const roomMain = new LRoomMain(address, cert, key);
roomMain.run();
