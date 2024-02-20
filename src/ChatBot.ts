import {CBWebSocket} from "./CBWebSocket";
import {ConfigStorage} from "./Config/ConfigStorage";

export class ChatBot {
    private socket: CBWebSocket;

    constructor() {
        ConfigStorage.loadConfigs();
        this.socket = new CBWebSocket("thecodingbuddies");
    }
}
