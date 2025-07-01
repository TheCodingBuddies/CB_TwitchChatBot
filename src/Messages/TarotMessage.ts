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

    private async startTarot() {
        TarotService.startTimer();
        try {
            await axios.post('http://localhost:8080/start', {
                user: this.username
            });
        } catch (e) {
            console.log('This is the error: ', e);
        }
        /* ToDo: return if successful */
    }

    answer(): string {
        let answer = 'Die Zukunft kann gerade nicht';
        if (!TarotService.isSessionActive()) {
            this.startTarot().then(); // todo: different answer if not successful
            answer = `Deine Tech-Zukunft erfährst du jetzt ${this.username}!`;
        }
        return new PrivateMessage(answer).content;
    }
}
