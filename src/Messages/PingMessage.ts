export class PingMessage implements Message {
    aliveText: string;

    constructor(message: string) {
        this.aliveText = message.split(' ')[1];
    }

    answer(): string {
        console.log("Got Ping Message -> Time to Response");
        return `PONG ${this.aliveText}`;
    }
}
