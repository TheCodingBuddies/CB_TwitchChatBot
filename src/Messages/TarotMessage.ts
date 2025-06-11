import {PrivateMessage} from "./PrivateMessage";
import * as http from "http";
import {RequestOptions} from "http";

export class TarotMessage implements Message {
    username: string;

    constructor(message: string) {
        let parts: string[] = message.split(' ');
        this.username = this.extractUsernameFrom(parts[0]);
    }

    private extractUsernameFrom(fullName: string): string {
        return fullName.split("!")[0].slice(1);
    }

    private startTarot() {
        const options: RequestOptions = {
            hostname: 'localhost',
            port: 8080,
            path: '/start',
            method: 'POST'
        }
        http.request(options);
        /* ToDo: check error case */
    }

    answer(): string {
        this.startTarot();
        const answer = `Deine Tech-Zukunft erfährst du jetzt ${this.username}!`;
        return new PrivateMessage(answer).content;
    }
}
