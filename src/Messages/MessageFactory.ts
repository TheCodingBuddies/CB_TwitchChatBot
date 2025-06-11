import {CommandMessage} from "./CommandMessage";
import {PingMessage} from "./PingMessage";
import {UnknownMessage} from "./UnknownMessage";
import {VoteMessage} from "./VoteMessage";
import {TarotMessage} from "./TarotMessage";

const voteCommandIdentifier: string[] = [":!vote", ":!vote-start"];
const tarotCommandIdentifier: string[] = [":!tech-tarot", ":!tt"];

export class MessageFactory {
    static parse(rawMessage: string): Message {
        if (this.isPrivateMessage(rawMessage)) {
            if (this.isVoteMessage(rawMessage)) {
                return new VoteMessage(rawMessage);
            }
            if (this.isTarotMessage(rawMessage)) {
                return new TarotMessage(rawMessage);
            }
            return new CommandMessage(rawMessage);
        } else if (this.isPingMessage(rawMessage)) {
            return new PingMessage(rawMessage);
        } else {
            return new UnknownMessage(rawMessage);
        }
    }

    private static isPingMessage(rawMessage: string) {
        return rawMessage.startsWith("PING");
    }

    private static isPrivateMessage(rawMessage: string) {
        return rawMessage.includes("PRIVMSG");
    }

    private static isVoteMessage(rawMessage: string): boolean {
        return voteCommandIdentifier.some(cmd => rawMessage.includes(cmd));
    }

    private static isTarotMessage(rawMessage: string): boolean {
        return tarotCommandIdentifier.some(cmd => rawMessage.includes(cmd));
    }
}
