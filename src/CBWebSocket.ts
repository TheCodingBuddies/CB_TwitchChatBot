import WebSocket, {RawData} from "ws"
import {MessageFactory} from "./Messages/MessageFactory";

export class CBWebSocket {

    readonly TWITCH_CHANNEL = "ws://irc-ws.chat.twitch.tv:80";
    client: WebSocket;
    channel: string;

    constructor(channel: string) {
        this.client = new WebSocket(this.TWITCH_CHANNEL);
        this.channel = channel;
        this.addListeners();
    }

    private addListeners() {
        this.client.on("open", () => {
            this.client.send(`CAP REQ :twitch.tv/commands`);
            this.client.send(`PASS oauth:${process.env.TOKEN}`);
            this.client.send(`NICK ${process.env.NICKNAME}`);
            this.client.send(`JOIN #${this.channel}`);
        });

        this.client.on("close", () => {
            console.log("closed");
        });

        this.client.on("message", (data: RawData) => {
            const rawMessages: string[] = data.toString().split('\r\n');
            for (let rawMessage of rawMessages) {
                let message: Message = MessageFactory.parse(rawMessage);
                this.client.send(message.answer());
            }
        })
    }
}
