import {CBWebSocket} from "./CBWebSocket";
import {CommandStorage} from "./Commands/CommandStorage";
import {PeriodicStorage} from "./Periodic/PeriodicStorage";

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
        new CBWebSocket("thecodingbuddies", true);
    }
}
