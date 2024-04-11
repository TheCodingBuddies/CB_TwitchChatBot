import {Command, CommandParser} from "../../src/Config/CommandParser";

let loadFileFailed = false;

jest.mock('fs', () => {
    const mockReadFileSync = ((path: string): string => {
        if (loadFileFailed) {
            throw new Error("File not found");
        }
        const firstCommand: Command = {name: "!firstcommand", response: "firstSuccess", cooldownInSec: 2};
        const secondCommand: Command = {name: "!secondCommand", response: "secondSuccess", cooldownInSec: 10};
        return JSON.stringify({commands: [firstCommand, secondCommand]})
    });

    return {
        readFileSync: mockReadFileSync
    }
})

describe('Parse Command Config', () => {
    beforeEach(() => {
        loadFileFailed = false;
    })

    it('parses from the correct config location', () => {
        expect(CommandParser.COMMAND_CONFIG_LOCATION).toEqual("assets/configs/commands.json");
    });

    it('parses the commands correctly to lower case', () => {
        const command: Command[] = CommandParser.parseLowerCase();
        expect(command).toHaveLength(2);
        expect(command[0].name).toEqual("!firstcommand");
        expect(command[0].response).toEqual("firstSuccess");
        expect(command[0].cooldownInSec).toEqual(2);
        expect(command[1].name).toEqual("!secondcommand");
        expect(command[1].response).toEqual("secondSuccess");
        expect(command[1].cooldownInSec).toEqual(10);
    });

    it('throws error on invalid file location and returns no commands', () => {
        loadFileFailed = true;
        expect(CommandParser.parseLowerCase()).toEqual([]);
    });

    it('parses the commands correctly in case sensitive', () => {
        const command: Command[] = CommandParser.parseCaseSensitive();
        expect(command).toHaveLength(2);
        expect(command[0].name).toEqual("!firstcommand");
        expect(command[0].response).toEqual("firstSuccess");
        expect(command[0].cooldownInSec).toEqual(2);
        expect(command[1].name).toEqual("!secondCommand");
        expect(command[1].response).toEqual("secondSuccess");
        expect(command[1].cooldownInSec).toEqual(10);
    });


    it('throws error on invalid file location and returns no commands', () => {
        loadFileFailed = true;
        expect(CommandParser.parseCaseSensitive()).toEqual([]);
    });
})
