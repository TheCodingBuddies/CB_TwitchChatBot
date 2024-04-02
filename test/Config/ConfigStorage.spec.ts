import {ConfigStorage} from "../../src/Config/ConfigStorage";
import {Command, CommandParser} from "../../src/Config/CommandParser";
import {DuplicateCommandError} from "../../src/Config/DuplicateCommandError";

const mockParse = ((): Command[] => {
    return [{
        name: "!command",
        response: "doMockThings",
        cooldownInSec: 2
    }, {
        name: '!command2',
        response: "doOtherMockThings",
        cooldownInSec: 2
    }]
});

const mockParseDuplicates = ((): Command[] => {
    return [{
        name: "!command",
        response: "doMockThings",
        cooldownInSec: 2
    }, {
        name: "!command",
        response: "doMockThingsAgain",
        cooldownInSec: 2
    }, {
        name: '!command2',
        response: "doOtherMockThings",
        cooldownInSec: 2
    }]
});

describe('ConfigStorage', () => {

    beforeEach(() => {
        CommandParser.parse = mockParse;
    })

    describe('load config', () => {
        it('return empty commands without config loading', () => {
            expect(ConfigStorage.getCommands()).toHaveLength(0);
        });

        it('loads command config', () => {
            ConfigStorage.loadConfig();
            const loadedCommands: Command[] = ConfigStorage.getCommands();
            expect(loadedCommands).toHaveLength(2);
            expect(loadedCommands[0]).toEqual({name: "!command", response: "doMockThings", cooldownInSec: 2});
            expect(loadedCommands[1]).toEqual({name: '!command2', response: "doOtherMockThings", cooldownInSec: 2});
        });

        it('throws DuplicateCommandError on identical command name', () => {
            CommandParser.parse = mockParseDuplicates;
            expect(() => {
                ConfigStorage.loadConfig();
            }).toThrow(DuplicateCommandError);
            expect(() => {
                ConfigStorage.loadConfig();
            }).toThrow('Duplicate command !command found');
        });
    });

    describe('timeout list handling', () => {
        it('has a empty timeout list on config load', () => {
            ConfigStorage.loadConfig();
            expect(ConfigStorage.timeoutList.count()).toEqual(0);
        });
    });
});
