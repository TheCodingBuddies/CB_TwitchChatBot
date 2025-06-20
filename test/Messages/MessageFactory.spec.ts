import {MessageFactory} from "../../src/Messages/MessageFactory";
import {CommandMessage} from "../../src/Messages/CommandMessage";
import {PingMessage} from "../../src/Messages/PingMessage";
import {UnknownMessage} from "../../src/Messages/UnknownMessage";
import {VoteMessage} from "../../src/Messages/VoteMessage";
import {TarotMessage} from "../../src/Messages/TarotMessage";
import {RawMessage} from "../../src/Messages/RawMessage";

describe('return correct messages', () => {
    it('returns CommandMessage on Command PRIVMSG', () => {
        const rawData = ":user!user@user.tmi.twitch.tv PRIVMSG #channel :!content";
        const rawMessage = new RawMessage(rawData);
        expect(MessageFactory.process(rawMessage)
            instanceof CommandMessage).toBeTruthy();
    });

    it('returns VoteMessage on Command PRIVMSG with valid vote command', () => {
        const rawData1 = ":user!user@user.tmi.twitch.tv PRIVMSG #channel :!vote";
        const rawMessage1 = new RawMessage(rawData1);
        expect(MessageFactory.process(rawMessage1)
            instanceof VoteMessage).toBeTruthy();
        const rawData2 = ":user!user@user.tmi.twitch.tv PRIVMSG #channel :!vote-start";
        const rawMessage2 = new RawMessage(rawData2);
        expect(MessageFactory.process(rawMessage2)
            instanceof VoteMessage).toBeTruthy();
    });

    it('returns TarotMessage on Command PRIVMSG with valid tech tarot command', () => {
        const rawData1 = ":user!user@user.tmi.twitch.tv PRIVMSG #channel :!tech-tarot";
        const rawMessage1 = new RawMessage(rawData1);
        expect(MessageFactory.process(rawMessage1)
            instanceof TarotMessage).toBeTruthy();
        const rawData2 = ":user!user@user.tmi.twitch.tv PRIVMSG #channel :!tt";
        const rawMessage2 = new RawMessage(rawData2);
        expect(MessageFactory.process(rawMessage2)
            instanceof TarotMessage).toBeTruthy();
    });

    it('returns PingMessage on Command PING', () => {
        const rawData = "PING :tmi.twitch.tv";
        const rawMessage = new RawMessage(rawData);
        expect(MessageFactory.process(rawMessage)
            instanceof PingMessage).toBeTruthy();
    });

    it('returns UnknownMessage on unknown Command', () => {
        const rawData = "UNKNOWN :tmi.twitch.tv";
        const rawMessage = new RawMessage(rawData);
        expect(MessageFactory.process(rawMessage)
            instanceof UnknownMessage).toBeTruthy();
    });
})
