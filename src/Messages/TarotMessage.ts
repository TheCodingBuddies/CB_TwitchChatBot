import {PrivateMessage} from "./PrivateMessage";
import {RawMessage} from "./RawMessage";

export const tarotCommandIdentifier: string[] = ["!tech-tarot", "!tt"];

export class TarotMessage implements Message {
    username: string;
    command: string;

    constructor(message: RawMessage) {
        let parts: string[] = message.content.message.split(' ');
        this.username = message.content.prefix.nickname
        this.command = parts[0];
    }

    async answer(): Promise<string> {
        let answer = `Nutze deine ${process.env.CHANNEL_POINT_NAME} um deine Tech-Zukunft zu erfahren!`;
        return new PrivateMessage(answer).content;
    }
}
