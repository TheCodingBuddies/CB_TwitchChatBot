import {CommandStorage} from "./Commands/CommandStorage";
import {PeriodicStorage} from "./Periodic/PeriodicStorage";
import {CBEventWebsocket} from "./CBEventWebsocket";
import {CBChatWebsocket} from "./CBChatWebsocket";

export class ChatBot {

    constructor() {
        try {
            CommandStorage.loadConfig();
            PeriodicStorage.loadConfig();
        } catch (error) {
            console.error(error.message);
            process.exit(-1);
        }
    }

    start() {
        new CBChatWebsocket("thecodingbuddies", true);
        // new CBEventWebsocket("thecodingbuddies", true);
    }
}
