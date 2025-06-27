import {CBWebSocket} from "./CBWebSocket";
import {ConfigStorage} from "./Config/ConfigStorage";

export class ChatBot {

    constructor() {
        try {
            ConfigStorage.loadConfig();
        } catch (error) {
            console.error(error.message);
            process.exit(-1);
        }
    }

    start() {
        new CBWebSocket("thecodingbuddies", true);
    }
}
