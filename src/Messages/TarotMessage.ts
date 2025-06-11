import {PrivateMessage} from "./PrivateMessage";
import * as http from "http";
import {RequestOptions} from "http";
import axios from "axios";

export class TarotMessage implements Message {
    username: string;

    constructor(message: string) {
        let parts: string[] = message.split(' ');
        this.username = this.extractUsernameFrom(parts[0]);
    }

    private extractUsernameFrom(fullName: string): string {
        return fullName.split("!")[0].slice(1);
    }

    private async startTarot() {
        try {
            const res = await axios.post('http://localhost:8080/start')
            console.log(res.data)
        } catch (e) {
            console.log('This is the error: ', e);
        }

        /* ToDo: check error case */
    }

    answer(): string {
        this.startTarot().then();
        const answer = `Deine Tech-Zukunft erfährst du jetzt ${this.username}!`;
        return new PrivateMessage(answer).content;
    }
}
