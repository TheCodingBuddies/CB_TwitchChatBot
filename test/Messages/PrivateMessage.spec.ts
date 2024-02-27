import {PrivateMessage} from "../../src/Messages/PrivateMessage";
import {Command} from "../../src/Config/CommandParser";
import {ConfigStorage} from "../../src/Config/ConfigStorage";

const mockGetCommand = () : Command[] => {
    return [{name: '!dc', response: 'discordLink'},
        {name: '!hello', response: 'Hi ${sender}!'}]
};


describe('Message Parser Tests', () => {

    beforeEach(() => {
        process.env.NICKNAME = "nickname";
        ConfigStorage.getCommands = mockGetCommand;
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
        it('answer discord link on !dc', () => {
            const message = new PrivateMessage(":username PRIVMSG #channel :!dc");
            expect(message.answer()).toEqual(":nickname PRIVMSG #channel :discordLink");
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
