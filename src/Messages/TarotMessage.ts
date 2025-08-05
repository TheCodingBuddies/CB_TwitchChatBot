import { PrivateMessage } from "./PrivateMessage";
import { RawMessage } from "./RawMessage";
import { TarotService } from "../Tarot/TarotService";
import axios from "axios";

export const tarotCommandIdentifier: string[] = ["!tech-tarot", "!tt"];

const PREMIUM_USERS: string[] = ["grouvie", "anomalienchen"];

export class TarotMessage implements Message {
  username: string;
  command: string;

  constructor(message: RawMessage) {
    let parts: string[] = message.content.message.split(" ");
    this.username = message.content.prefix.nickname;
    this.command = parts[0];
  }

  async answer(): Promise<string> {
    if (PREMIUM_USERS.includes(this.username.toLowerCase())) {
      return await this.initializeTechTarotSession();
    } else {
      let answer =
        "Nutze deine Kartoffelherzen um deine Tech-Zukunft zu erfahren!";
      return new PrivateMessage(answer).content;
    }
  }
  private async startTarot(): Promise<boolean> {
    TarotService.startTimer();
    try {
      const response = await axios.post("http://localhost:8080/start", {
        user: this.username,
      });
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }
  private async initializeTechTarotSession(): Promise<string> {
    let answer = "Die Zukunft kann gerade nicht";
    if (!TarotService.isSessionActive()) {
      const successful = await this.startTarot();
      answer = successful
        ? `Deine Tech-Zukunft erfährst du jetzt ${this.username}!`
        : "Die Zukunft hat gerade geschlossen!";
    }
    return new PrivateMessage(answer).content;
  }
}
