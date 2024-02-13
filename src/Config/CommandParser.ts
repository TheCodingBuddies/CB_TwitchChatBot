import {readFileSync} from "fs";


export interface Command {
    name: string,
    response: string
}

export interface CommandCollection {
    commands: Command[]
}

export class CommandParser {

    static readonly COMMAND_CONFIG_LOCATION = 'assets/configs/commands.json';

    static parse(): Command[] {
        let collection: CommandCollection = {commands: []};
        try {
            collection = JSON.parse(readFileSync(this.COMMAND_CONFIG_LOCATION, {encoding: 'utf-8'}));
        } catch (error) {
            console.log(error.message);
        }
        return collection.commands;
    }
}
