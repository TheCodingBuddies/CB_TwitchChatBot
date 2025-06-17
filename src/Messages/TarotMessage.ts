import {PrivateMessage} from "./PrivateMessage";
import axios from "axios";
import {TarotService} from "../Tarot/TarotService";

export class TarotMessage implements Message {
    username: string;
    command: string;

    readonly tarotStartCommands = ['!tech-tarot', '!tt'];

    constructor(message: string) {
        let parts: string[] = message.split(' ');
        this.username = this.extractUsernameFrom(parts[0]);
        this.command = this.extractCommand(parts);
    }

    // todo: refactor common message functions
    private extractUsernameFrom(fullName: string): string {
        return fullName.split("!")[0].slice(1);
    }

    private extractCommand(parts: string[]) {
        return parts[3].slice(1);
    }

    private async startTarot() {
        TarotService.startTimer();
        try {
            const res = await axios.post('http://localhost:8080/start')
            console.log(res.data)
        } catch (e) {
            console.log('This is the error: ', e);
        }
        /* ToDo: return if successful */
    }

    answer(): string {
        if (!this.tarotStartCommands.includes(this.command)) {
            return "";
        }
        let answer = 'Die Zukunft kann gerade nicht';
        if (!TarotService.isSessionActive()) {
            this.startTarot().then(); // todo: different answer if not successful
            answer = `Deine Tech-Zukunft erfährst du jetzt ${this.username}!`;
        }
        return new PrivateMessage(answer).content;
    }
}
