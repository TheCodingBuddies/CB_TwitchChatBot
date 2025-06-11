import {MessageFactory} from "../../src/Messages/MessageFactory";
import {CommandMessage} from "../../src/Messages/CommandMessage";
import {PingMessage} from "../../src/Messages/PingMessage";
import {UnknownMessage} from "../../src/Messages/UnknownMessage";
import {VoteMessage} from "../../src/Messages/VoteMessage";
import {TarotMessage} from "../../src/Messages/TarotMessage";

describe('return correct messages', () => {
    it('returns CommandMessage on Command PRIVMSG', () => {
        expect(MessageFactory.parse("user PRIVMSG #channel :content")
            instanceof CommandMessage).toBeTruthy();
    });

    it('returns VoteMessage on Command PRIVMSG with valid vote command', () => {
        expect(MessageFactory.parse("user PRIVMSG #channel :!vote")
            instanceof VoteMessage).toBeTruthy();
        expect(MessageFactory.parse("user PRIVMSG #channel :!vote-start")
            instanceof VoteMessage).toBeTruthy();
    });

    it('returns TarotMessage on Command PRIVMSG with valid tech tarot command', () => {
        expect(MessageFactory.parse("user PRIVMSG #channel :!tech-tarot")
            instanceof TarotMessage).toBeTruthy();
        expect(MessageFactory.parse("user PRIVMSG #channel :!tt")
            instanceof TarotMessage).toBeTruthy();
    });

    it('returns PingMessage on Command PING', () => {
        expect(MessageFactory.parse("PING :tmi.twitch.tv")
            instanceof PingMessage).toBeTruthy();
    });

    it('returns UnknownMessage on unknown Command', () => {
        expect(MessageFactory.parse("UNKNOWN :tmi.twitch.tv")
            instanceof UnknownMessage).toBeTruthy();
    });
})
