import {PrivateMessage} from "./PrivateMessage";
import axios from "axios";
import {TarotService} from "../Tarot/TarotService";
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

    private async startTarot(): Promise<boolean> {
        TarotService.startTimer();
        try {
            const response = await axios.post('http://localhost:8080/start', {
                user: this.username
            });
            return response.status === 200;
        } catch (err) {
            return false;
        }
    }

    async answer(): Promise<string> {
        let answer = 'Die Zukunft kann gerade nicht';
        if (!TarotService.isSessionActive()) {
            const successful = await this.startTarot();
            answer = successful
                ? `Deine Tech-Zukunft erfährst du jetzt ${this.username}!`
                : 'Die Zukunft hat gerade geschlossen!';
        }
        return new PrivateMessage(answer).content;
    }
}
