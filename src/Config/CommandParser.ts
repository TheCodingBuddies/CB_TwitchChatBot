import {readFileSync} from "fs";


export interface Command {
    name: string,
    response: string,
    cooldownInSec: number,
}

export interface CommandCollection {
    commands: Command[]
}

export class CommandParser {

    static readonly COMMAND_CONFIG_LOCATION = 'assets/configs/commands.json';

    static parseLowerCase(): Command[] {
        let collection = this.parse();
        return collection.commands.map(cmd => {
            return {name: cmd.name.toLowerCase(), response: cmd.response, cooldownInSec: cmd.cooldownInSec}
        });
    }
    static parseCaseSensitive(): Command[] {
        let collection = this.parse();
        return collection.commands.map(cmd => {
            return {name: cmd.name, response: cmd.response, cooldownInSec: cmd.cooldownInSec}
        });
    }

    private static parse(): CommandCollection {
        let collection: CommandCollection = {commands: []};
        try {
            collection = JSON.parse(readFileSync(this.COMMAND_CONFIG_LOCATION, {encoding: 'utf-8'}));
        } catch (error) {
            console.log(error.message);
        }
        return collection;
    }
}
