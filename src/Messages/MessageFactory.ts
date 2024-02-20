import {PrivateMessage} from "./PrivateMessage";
import {PingMessage} from "./PingMessage";
import {UnknownMessage} from "./UnknownMessage";

export class MessageFactory {
    static parse(rawMessage: string): Message {
        if (rawMessage.includes("PRIVMSG")) {
            return new PrivateMessage(rawMessage);
        } else if (rawMessage.startsWith("PING")) {
            return new PingMessage(rawMessage);
        } else {
            return new UnknownMessage(rawMessage);
        }
    }
}
