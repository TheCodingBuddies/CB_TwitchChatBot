import {PeriodicStorage} from "./PeriodicStorage";
import EventEmitter from "events";

export class PeriodicService {
    static intervalResult: EventEmitter = new EventEmitter();
    private static nextMessageCounter: number = 0;
    constructor() {
    }

    static startInterval(): boolean {
        let started = false;
        if (PeriodicStorage.getMessages().length === 0) {
            return started;
        }
        setInterval(() => {
            this.sendMessage();
        }, PeriodicStorage.getFrequencyInSec() * 1000);
        started = true;
        return started;
    }

    private static sendMessage() {
        const message = PeriodicStorage.getType() === "rand" ? this.getRandomMessage() : this.getNextMessage();
        this.intervalResult.emit("IntervalOver", message);
    }

    private static getRandomMessage(): string {
        const messages = PeriodicStorage.getMessages();
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    private static getNextMessage(): string {
        const messages = PeriodicStorage.getMessages();
        const message = messages[this.nextMessageCounter];
        this.nextMessageCounter++;
        if (this.nextMessageCounter == messages.length){
            this.nextMessageCounter = 0;
        }
        return message;
    }
}