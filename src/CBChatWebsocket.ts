import WebSocket, {RawData} from "ws"
import {MessageFactory} from "./Messages/MessageFactory";
import {VotingService} from "./Voting/VotingService";
import {PrivateMessage} from "./Messages/PrivateMessage";
import {RawMessage} from "./Messages/RawMessage";
import {TokenUpdater} from "./Auth/TokenUpdater";
import {PeriodicService} from "./Periodic/PeriodicService";

export class CBChatWebsocket {

    readonly TWITCH_CHAT_CHANNEL = "wss://irc-ws.chat.twitch.tv:443";
    readonly LAST_VOTE_RESULT = "lastVoteResult";
    readonly VOTE_REMINDER = "VoteReminder";
    readonly INTERVAL_OVER = "IntervalOver";
    client: WebSocket;
    channel: string;
    readonly token: string;
    useCapabilities: boolean;

    constructor(channel: string, useCapabilities: boolean) {
        this.client = new WebSocket(this.TWITCH_CHAT_CHANNEL);
        this.channel = channel;
        this.token = TokenUpdater.loadTokenData().access_token;
        this.useCapabilities = useCapabilities;
        this.registerListener();
        this.registerVotingListener();
        this.registerPeriodicListener();
    }

    private registerPeriodicListener(): void {
        PeriodicService.startInterval();
        PeriodicService.intervalResult.on(this.INTERVAL_OVER, (message: string) => {
            this.client.send(new PrivateMessage(message).content);
        })
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
        this.client.on("open", this.handleOpenConnection.bind(this));
        this.client.on("close", this.handleCloseConnection.bind(this));
        this.client.on("message", this.handleMessage.bind(this));
        this.client.on("error", this.handleError.bind(this));
    }

    private handleOpenConnection() {
        this.client.send(`PASS oauth:${this.token}`);
        this.client.send(`NICK ${process.env.NICKNAME}`);
        const littleCaps = `CAP REQ :twitch.tv/commands`;
        const fullCaps = 'CAP REQ :twitch.tv/tags CAP REQ :twitch.tv/commands twitch.tv/membership';
        const caps = this.useCapabilities ? fullCaps : littleCaps;
        this.client.send(caps);
        this.client.send(`JOIN #${this.channel}`);
    }

    private handleMessage(data: RawData) {
        const allRawData: string[] = data.toString()
            .split('\r\n')
            .filter(raw => raw.trim().length > 0);

        allRawData.forEach(async rawData => {
            let rawMessage: RawMessage = new RawMessage(rawData);
            let message: Message = MessageFactory.process(rawMessage);
            if (message?.answer) {
                const answer = await message.answer()
                this.client.send(answer);
            }
        });
    }

    private handleError(err: Error) {
        console.error("WebSocket error:", err);
    }

    private handleCloseConnection() {
        console.log("closed");
    }
}
