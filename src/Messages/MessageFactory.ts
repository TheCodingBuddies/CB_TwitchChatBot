import {CommandMessage} from "./CommandMessage";
import {PingMessage} from "./PingMessage";
import {UnknownMessage} from "./UnknownMessage";
import {VoteMessage} from "./VoteMessage";
import {tarotCommandIdentifier, TarotMessage} from "./TarotMessage";
import {PING, PRIVMSG, RawMessage} from "./RawMessage";

export class MessageFactory {
    static process(rawMessage: RawMessage): Message {
        switch (rawMessage.content.command) {
            case PRIVMSG:
                return this.parseChatCommand(rawMessage)
            case PING:
                return new PingMessage(rawMessage.content.raw);
            default:
                return new UnknownMessage(rawMessage.content.raw);
        }
    }

    private static parseChatCommand(message: RawMessage): Message {
        const text = message.content.message?.trim() ?? "";

        const command = text.split(" ")[0];

        if (command.startsWith("!vote")) {
            return new VoteMessage(message);
        }
        if (tarotCommandIdentifier.includes(command)) {
            return new TarotMessage(message);
        }
        return new CommandMessage(message);
    }
}
