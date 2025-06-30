import {PeriodicStorage} from "./PeriodicStorage";
import EventEmitter from "events";

export class PeriodicService {
    static intervalResult: EventEmitter = new EventEmitter();

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
        const messages = PeriodicStorage.getMessages();
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        this.intervalResult.emit("IntervalOver", message);
    }
}