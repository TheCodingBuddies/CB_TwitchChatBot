import {Command, CommandParser} from "../../src/Config/CommandParser";

let loadFileFailed = false;

jest.mock('fs', () => {
    const mockReadFileSync = ((path: string): string => {
        if (loadFileFailed) {
            throw new Error("File not found");
        }
        const firstCommand: Command = {name: "!firstCommand", response: "firstSuccess"};
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
        expect(command[0].name).toEqual("!firstCommand");
        expect(command[0].response).toEqual("firstSuccess");
        expect(command[1].name).toEqual("!secondCommand");
        expect(command[1].response).toEqual("secondSuccess");
    });

    it('throws error on invalid file location', () => {
        loadFileFailed = true;
        expect(CommandParser.parse()).toEqual([]);

    });
})
