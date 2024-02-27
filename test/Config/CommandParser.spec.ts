import {Command, CommandParser} from "../../src/Config/CommandParser";

let loadFileFailed = false;

jest.mock('fs', () => {
    const mockReadFileSync = ((path: string): string => {
        if (loadFileFailed) {
            throw new Error("File not found");
        }
        const firstCommand: Command = {name: "!firstcommand", response: "firstSuccess"};
        const secondCommand: Command = {name: "!secondCommand", response: "secondSuccess"};
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

    it('parses a command correctly', () => {
        const command: Command[] = CommandParser.parse();
        expect(command).toHaveLength(2);
        expect(command[0].name).toEqual("!firstcommand");
        expect(command[0].response).toEqual("firstSuccess");
        expect(command[1].name).toEqual("!secondcommand");
        expect(command[1].response).toEqual("secondSuccess");
    });

    it('throws error on invalid file location and returns no commands', () => {
        loadFileFailed = true;
        expect(CommandParser.parse()).toEqual([]);
    });
})
