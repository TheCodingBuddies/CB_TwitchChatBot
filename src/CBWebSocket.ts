import WebSocket, {RawData} from "ws"
import {MessageFactory} from "./Messages/MessageFactory";
import {VotingService} from "./Voting/VotingService";
import {PrivateMessage} from "./Messages/PrivateMessage";
import {RawMessage} from "./Messages/RawMessage";

export class CBWebSocket {

    readonly TWITCH_CHANNEL = "ws://irc-ws.chat.twitch.tv:80";
    readonly LAST_VOTE_RESULT = "lastVoteResult";
    readonly VOTE_REMINDER = "VoteReminder";
    client: WebSocket;
    channel: string;

    constructor(channel: string) {
        this.client = new WebSocket(this.TWITCH_CHANNEL);
        this.channel = channel;
        this.registerListener();
        this.registerVotingListener();
    }

    private registerVotingListener(): void {
        VotingService.recentResult.on(this.LAST_VOTE_RESULT, (result: string) => {
            this.client.send(new PrivateMessage(result).content);
        });
        VotingService.voteReminder.on(this.VOTE_REMINDER, (reminderMessage: string) => {
            this.client.send(new PrivateMessage(reminderMessage).content);
        });
    }

    private registerListener() {
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
            const allRawData: string[] = data.toString().split('\r\n');
            for (let rawData of allRawData) {
                if (rawData.trim().length > 0) {
                    let rawMessage: RawMessage = new RawMessage(rawData);
                    let message: Message = MessageFactory.process(rawMessage);
                    this.client.send(message.answer());
                }
            }
        })
    }
}
