import {PrivateMessage} from "../../src/Messages/PrivateMessage";
import {Command, CommandScope} from "../../src/Config/CommandParser";
import {ConfigStorage} from "../../src/Config/ConfigStorage";
import {CommandTimeoutList} from "../../src/Config/CommandTimeoutList";

const testCommandTimoutInSec: number = 2;
const mockGetCommand = () : Command[] => {
    return [{name: '!dc', response: 'discordLink', cooldownInSec: testCommandTimoutInSec, scope: CommandScope.GLOBAL},
        {name: '!hello', response: 'Hi ${sender}!', cooldownInSec: testCommandTimoutInSec, scope: CommandScope.GLOBAL}]
};


describe('Message Parser Tests', () => {
    let timeoutList: CommandTimeoutList;

    beforeEach(() => {
        process.env.NICKNAME = "nickname";
        ConfigStorage.getCommands = mockGetCommand;
        timeoutList = new CommandTimeoutList();
        ConfigStorage.timeoutList = timeoutList;
        Date.now = () => 1;
    })

    describe('parses the PrivateMessage correctly', () => {
        it('parses the correct user name', () => {
            const message = new PrivateMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :content");
            expect(message.username).toEqual("user123");
        });

        it('parses the correct channel', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :content");
            expect(message.channel).toEqual("channel");
        });

        it('parses the correct text', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :contentPart1 contentPart2");
            expect(message.content).toEqual("contentPart1 contentPart2");
        });

        it('parses !dc command', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!dc");
            expect(message.content).toEqual("!dc");
        });
    })

    describe('responding PrivateMessages', () => {
        it('answer discord link on !dc when it has no timeout', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!dc");
            expect(message.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
        })

        it('does not answer discord link on !dc when it has a timeout', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!dc");
            message.answer();
            expect(message.answer()).toEqual("");
        })

        it('answers discord link on !dc after timeout is over', () => {
            Date.now = () => 1;
            const messageOfUserA = new PrivateMessage(":userA PRIVMSG #channel :!dc");
            const messageOfUserB = new PrivateMessage(":userB PRIVMSG #channel :!dc");
            messageOfUserA.answer()
            Date.now = () => testCommandTimoutInSec*1000 + 1;
            expect(messageOfUserB.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
        })

        it('answer on command even on wrong letter cases', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!Dc");
            expect(message.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
        })

        it('answers nothing on unknown command', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!unknown");
            expect(message.answer()).toEqual("");
        })

        it('replaces the ${sender} placeholder with username', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!hello");
            expect(message.answer()).toEqual(":nickname PRIVMSG #channel :Hi username!");
        });
    })

    describe('error handling', () => {
        it('throws error on incomplete Message', () => {
            expect(() => new PrivateMessage("")).toThrow(new Error("Message incomplete"));
        });
    })
});
