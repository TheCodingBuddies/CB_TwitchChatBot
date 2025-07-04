export class PingMessage implements Message {
    aliveText: string;

    constructor(message: string) {
        this.aliveText = message.split(' ')[1];
    }

    async answer(): Promise<string> {
        console.log("Got Ping Message -> Time for Ping Pong");
        return `PONG ${this.aliveText}`;
    }
}
