import {ConfigStorage} from "../../src/Config/ConfigStorage";
import {Command, CommandParser} from "../../src/Config/CommandParser";
import {DuplicateCommandError} from "../../src/Config/DuplicateCommandError";

const mockParse = ((): Command[] => {
    return [{
        name: "!command",
        response: "doMockThings"
    }, {
        name: '!command2',
        response: "doOtherMockThings"
    }]
});

const mockParseDuplicates = ((): Command[] => {
    return [{
        name: "!command",
        response: "doMockThings"
    }, {
        name: "!command",
        response: "doMockThingsAgain"
    }, {
        name: '!command2',
        response: "doOtherMockThings"
    }]
});

describe('ConfigStorage', () => {

    beforeEach(() => {
        CommandParser.parse = mockParse;
    })

    it('return empty commands without config loading', () => {
        expect(ConfigStorage.getCommands()).toHaveLength(0);
    });

    it('loads command config', () => {
        ConfigStorage.loadConfigs();
        const loadedCommands: Command[] = ConfigStorage.getCommands();
        expect(loadedCommands).toHaveLength(2);
        expect(loadedCommands[0]).toEqual({name: "!command", response: "doMockThings"});
        expect(loadedCommands[1]).toEqual({name: '!command2', response: "doOtherMockThings"});
    });

    it('throws DuplicateCommandError on identical command name', () => {
        CommandParser.parse = mockParseDuplicates;
        expect(() => {
            ConfigStorage.loadConfigs()
        }).toThrow(DuplicateCommandError);
        expect(() => {
            ConfigStorage.loadConfigs()
        }).toThrow('Duplicate command !command found');
    });
});
