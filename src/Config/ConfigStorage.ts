import {Command, CommandParser} from "./CommandParser";
import {DuplicateCommandError} from "./DuplicateCommandError";
import {CommandTimeoutList} from "./CommandTimeoutList";

export class ConfigStorage {

    private static commands: Command[] = [];
    static timeoutList: CommandTimeoutList;

    static getCommands(): Command[] {
        if (!this.commands.length) {
            console.log('Warning: You didnt defined commands for your chatbot!');
            console.log('Forget to load? ;-)');
        }
        return this.commands;
    }

    static loadConfig() {
        this.timeoutList = new CommandTimeoutList();
        this.commands = CommandParser.parse();
        this.checkDuplicates();
    }

    private static checkDuplicates() {
        let allCommandNames: string[] = this.commands.map(c => c.name);
        let filteredCommands: string[] = [];
        for (let name of allCommandNames) {
            if (filteredCommands.find((filteredName: string) => filteredName === name))
                throw new DuplicateCommandError(name)
            filteredCommands.push(name);
        }
    }
}
