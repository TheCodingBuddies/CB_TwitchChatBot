import { CBWebSocket } from "./CBWebSocket";
import { ConfigStorage } from "./Config/ConfigStorage";

export class ChatBot {
    private socket: CBWebSocket;

    constructor() {
        try {
            ConfigStorage.loadConfig();
        } catch (error) {
            console.error(error.message);
            process.exit(-1);
        }
        this.socket = new CBWebSocket(`${process.env.TWITCH_CHANNEL_NAME}`);
    }
}
