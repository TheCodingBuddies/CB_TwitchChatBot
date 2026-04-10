import {CommandStorage} from "../../src/Commands/CommandStorage";
import {Command, CommandParser, CommandScope} from "../../src/Commands/CommandParser";
import {DuplicateCommandError} from "../../src/Commands/DuplicateCommandError";

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

describe('CommandStorage', () => {

    beforeEach(() => {
        CommandParser.parseLowerCase = mockParseLowerCase;
        CommandParser.parseCaseSensitive = mockParseCaseSensitive;
    })

    describe('load config', () => {
        it('return empty commands without config loading', () => {
            expect(CommandStorage.getCommands()).toHaveLength(0);
        });

        it('loads command config', () => {
            CommandStorage.loadConfig();
            const loadedCommands: Command[] = CommandStorage.getCommands();
            const commandsResponse = "Verfügbare Commands: [!Command, !command2]";
            expect(loadedCommands).toHaveLength(3);
            expect(loadedCommands[0]).toEqual({name: "!command", response: "doMockThings", cooldownInSec: 2, scope: CommandScope.GLOBAL});
            expect(loadedCommands[1]).toEqual({name: '!command2', response: "doOtherMockThings", cooldownInSec: 2, scope: CommandScope.GLOBAL});
            expect(loadedCommands[2]).toEqual({name: '!commands', response: commandsResponse, cooldownInSec: 60, scope: CommandScope.GLOBAL});
        });

        it('throws DuplicateCommandError on identical command name', () => {
            CommandParser.parseLowerCase = mockParseDuplicates;
            expect(() => {
                CommandStorage.loadConfig();
            }).toThrow(DuplicateCommandError);
            expect(() => {
                CommandStorage.loadConfig();
            }).toThrow('Duplicate command !command found');
        });
    });

    describe('timeout list handling', () => {
        it('has a empty timeout list on config load', () => {
            CommandStorage.loadConfig();
            expect(CommandStorage.timeoutList.count()).toEqual(0);
        });
    });
});
