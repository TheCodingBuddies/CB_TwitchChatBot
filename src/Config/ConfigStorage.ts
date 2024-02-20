import {Command, CommandParser} from "./CommandParser";

export class ConfigStorage {

    private static commands : Command[] = [];

    static getCommands() : Command[] {
        if (!this.commands.length) {
            console.log('Warning: You didnt defined commands for your chatbot!');
            console.log('Forget to load? ;-)');
        }
        return this.commands;
    }

    static loadConfigs() {
        this.commands = CommandParser.parse();
    }
}
