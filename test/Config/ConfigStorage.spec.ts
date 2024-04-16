import {ConfigStorage} from "../../src/Config/ConfigStorage";
import {Command, CommandParser, CommandScope} from "../../src/Config/CommandParser";
import {DuplicateCommandError} from "../../src/Config/DuplicateCommandError";

let parsedCommands : Command[] = [{
    name: "!Command",
    response: "doMockThings",
    cooldownInSec: 2,
    scope: CommandScope.GLOBAL
}, {
    name: '!command2',
    response: "doOtherMockThings",
    cooldownInSec: 2,
    scope: CommandScope.GLOBAL
}];

const mockParseLowerCase = ((): Command[] => {
    let lowerCaseCommands = parsedCommands.slice();
    lowerCaseCommands[0] = {...parsedCommands[0], name: parsedCommands[0].name.toLowerCase()};
    return lowerCaseCommands;
});

const mockParseCaseSensitive = ((): Command[] => {
    return parsedCommands;
});

const mockParseDuplicates = ((): Command[] => {
    return [{
        name: "!command",
        response: "doMockThings",
        cooldownInSec: 2,
        scope: CommandScope.GLOBAL
    }, {
        name: "!command",
        response: "doMockThingsAgain",
        cooldownInSec: 2,
        scope: CommandScope.GLOBAL
    }, {
        name: '!command2',
        response: "doOtherMockThings",
        cooldownInSec: 2,
        scope: CommandScope.GLOBAL
    }]
});

describe('ConfigStorage', () => {

    beforeEach(() => {
        CommandParser.parseLowerCase = mockParseLowerCase;
        CommandParser.parseCaseSensitive = mockParseCaseSensitive;
    })

    describe('load config', () => {
        it('return empty commands without config loading', () => {
            expect(ConfigStorage.getCommands()).toHaveLength(0);
        });

        it('loads command config', () => {
            ConfigStorage.loadConfig();
            const loadedCommands: Command[] = ConfigStorage.getCommands();
            const commandsResponse = "Verfügbare Commands: [!Command, !command2]";
            expect(loadedCommands).toHaveLength(3);
            expect(loadedCommands[0]).toEqual({name: "!command", response: "doMockThings", cooldownInSec: 2, scope: CommandScope.GLOBAL});
            expect(loadedCommands[1]).toEqual({name: '!command2', response: "doOtherMockThings", cooldownInSec: 2, scope: CommandScope.GLOBAL});
            expect(loadedCommands[2]).toEqual({name: '!commands', response: commandsResponse, cooldownInSec: 60, scope: CommandScope.GLOBAL});
        });

        it('throws DuplicateCommandError on identical command name', () => {
            CommandParser.parseLowerCase = mockParseDuplicates;
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
