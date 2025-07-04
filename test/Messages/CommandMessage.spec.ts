import {CommandMessage} from "../../src/Messages/CommandMessage";
import {Command, CommandScope} from "../../src/Commands/CommandParser";
import {CommandStorage} from "../../src/Commands/CommandStorage";
import {CommandTimeoutList} from "../../src/Commands/CommandTimeoutList";
import {RawMessage} from "../../src/Messages/RawMessage";

const testCommandTimoutInSec: number = 2;
const mockGetCommand = (): Command[] => {
    return [
        {
            name: '!dc',
            response: 'discordLink',
            cooldownInSec: testCommandTimoutInSec,
            scope: CommandScope.GLOBAL
        },
        {
            name: '!hug ${param1}',
            response: '${sender} hugs ${param1}',
            cooldownInSec: testCommandTimoutInSec,
            scope: CommandScope.USER
        },
        {
            name: '!test ${param1} ${param2}',
            response: 'test ${param1} ${param2}',
            cooldownInSec: testCommandTimoutInSec,
            scope: CommandScope.USER
        },
        {
            name: '!hello',
            response: 'Hi ${sender}!',
            cooldownInSec: testCommandTimoutInSec,
            scope: CommandScope.GLOBAL
        }
    ];
};


describe('CommandMessageTest', () => {
    let timeoutList: CommandTimeoutList;

    beforeEach(() => {
        process.env.NICKNAME = "nickname";
        process.env.CHANNEL = "channel";
        CommandStorage.getCommands = mockGetCommand;
        timeoutList = new CommandTimeoutList();
        CommandStorage.timeoutList = timeoutList;
        Date.now = () => 1;
    })

    describe('parses the CommandMessage correctly', () => {
        it('parses the correct user name', () => {
            const rawData = ":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :content";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(message.username).toEqual("user123");
        });

        it('parses the correct channel', () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :content";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(message.channel).toEqual("channel");
        });

        it('parses the correct text', () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :contentPart1 contentPart2";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(message.content).toEqual("contentPart1 contentPart2");
        });

        it('parses !dc command', () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :!dc";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(message.content).toEqual("!dc");
        });
    })

    describe('responding PrivateMessages', () => {
        it('answer discord link on !dc when it has no timeout', async () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :!dc";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(await message.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
        })

        it('does not answer discord link on !dc when it has a timeout', async () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :!dc";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            await message.answer();
            expect(await message.answer()).toEqual("");
        })

        it('answers discord link on !dc after timeout is over', async () => {
            Date.now = () => 1;
            const rawDataA = ":userA!userA@userA.tmi.twitch.tv PRIVMSG #channel :!dc";
            const rawMessageA = new RawMessage(rawDataA);
            const messageOfUserA = new CommandMessage(rawMessageA);
            const rawDataB = ":userB!userB@userB.tmi.twitch.tv PRIVMSG #channel :!dc";
            const rawMessageB = new RawMessage(rawDataB);
            const messageOfUserB = new CommandMessage(rawMessageB);
            await messageOfUserA.answer()
            Date.now = () => testCommandTimoutInSec * 1000 + 1;
            expect(await messageOfUserB.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
        })

        it('answer on command even on wrong letter cases', async () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :!Dc";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(await message.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
        })

        it('answers nothing on unknown command', async () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :!unknown";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(await message.answer()).toEqual("");
        })

        it('answer nothing on extraction error', async () => {
            const rawData = ":userA!userA@userA.tmi.twitch.tv PRIVMSG #channel :!hug";
            const rawMessage = new RawMessage(rawData);
            expect(await new CommandMessage(rawMessage).answer()).toEqual("");
        });

        it('replaces the ${sender} placeholder with username', async () => {
            const rawData = ":username!username@username.tmi.twitch.tv PRIVMSG #channel :!hello";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(await message.answer()).toEqual(":nickname PRIVMSG #channel :Hi username!");
        });

        it('replaces the saved param', async () => {
            const rawData = ":userA!userA@userA.tmi.twitch.tv PRIVMSG #channel :!hug userB";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(await message.answer()).toEqual(":nickname PRIVMSG #channel :userA hugs userB");
        });

        it('replaces multiple saved params', async () => {
            const rawData = ":userA!userA@userA.tmi.twitch.tv PRIVMSG #channel :!test userB userC";
            const rawMessage = new RawMessage(rawData);
            const message = new CommandMessage(rawMessage);
            expect(await message.answer()).toEqual(":nickname PRIVMSG #channel :test userB userC");
        });
    })

    describe('error handling', () => {
        it('throws error on incomplete Message', () => {
            expect(() => new CommandMessage(new RawMessage(""))).toThrow(new Error("No command found"));
        });
    });
});
