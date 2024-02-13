import {CBWebSocket} from "./CBWebSocket";
import {Command, CommandParser} from "./Config/CommandParser";

export class ChatBot {
    private socket : CBWebSocket;
    commands: Command[];

    constructor() {
        this.commands = this.loadCommands();
        this.socket = new CBWebSocket("thecodingbuddies");
    }

    loadCommands() : Command[] {
        return CommandParser.parse();
    }
}
