import {MessageFactory} from "../../src/Messages/MessageFactory";
import {PrivateMessage} from "../../src/Messages/PrivateMessage";
import {PingMessage} from "../../src/Messages/PingMessage";
import {UnknownMessage} from "../../src/Messages/UnknownMessage";

describe('return correct messages', () => {
    it('returns PrivateMessage on Command PRIVMSG', () => {
        expect(MessageFactory.parse("user PRIVMSG #channel :content")
            instanceof PrivateMessage).toBeTruthy();
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
