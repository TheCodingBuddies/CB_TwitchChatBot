import axios from "axios";
import {PrivateMessage} from "../Messages/PrivateMessage";

export class TarotService {
    static readonly sessionTimeMs: number = 40 * 60 * 1000;
    private static activeSession: boolean = false;

    static startTimer(): void {
        this.activeSession  = true;
        setTimeout(() => {
            this.activeSession  = false;
        }, this.sessionTimeMs)
    }

    static isSessionActive(): boolean {
        return this.activeSession;
    }

    private static async startTarotFor(username: string): Promise<boolean> {
        TarotService.startTimer();
        try {
            const response = await axios.post('http://localhost:8080/start', {
                user: username
            });
            return response.status === 200;
        } catch (err) {
            return false;
        }
    }

    static async initializeTechTarotSessionFor(username: string) {
        let answer = 'Die Zukunft kann gerade nicht';
        if (!TarotService.isSessionActive()) {
            const successful = await this.startTarotFor(username);
            answer = successful
                ? `Deine Tech-Zukunft erfährst du jetzt ${username}!`
                : 'Die Zukunft hat gerade geschlossen!';
        }
        return new PrivateMessage(answer).content;
    }
}
