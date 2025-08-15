import WebSocket, {RawData} from "ws"
import assert from "node:assert";
import {SubscriptionEvent} from "./SubscriptionEvents/SubscriptionEvent";
import {TarotService} from "./Tarot/TarotService";
import {TwitchApi} from "./Auth/TwitchApi";

export class CBEventWebsocket {

    readonly TWITCH_EVENT_CHANNEL = "wss://eventsub.wss.twitch.tv/ws";
    private client: WebSocket;
    channel: string;
    chatClient: WebSocket;
    connected: boolean = false;
    username: string = "";

    constructor(channel: string, chatClient: WebSocket) {
        this.chatClient = chatClient;
        this.client = new WebSocket(this.TWITCH_EVENT_CHANNEL);
        this.channel = channel;
        this.client.on("open", this.handleOpenConnection.bind(this));
        this.client.on("message", this.onMessage.bind(this));
    }

    private handleOpenConnection() {
        console.log("event websocket opened");
        this.connected = true;
    }

    private async onMessage(data: RawData) {
        const json = JSON.parse(data.toString());
        assert(json.metadata, 'no metadata in event');
        switch (json.metadata.message_type) {
            case 'session_welcome':
                const customRewardEvent: SubscriptionEvent = {
                    type: "channel.channel_points_custom_reward_redemption.add",
                    version: "1",
                    condition: {
                        broadcaster_user_id: process.env.BROADCASTER_ID,
                    },
                    transport: {
                        method: "websocket",
                        session_id: json.payload.session.id
                    }
                }
                await TwitchApi.subscribeToChannel(customRewardEvent);
                break;
            case 'session_reconnect':
                console.log("session_reconnect received");
                break;
            case 'notification':
                if (json.payload.event.reward.title === "Tech Tarot") {
                    this.username = json.payload.event.user_name;
                    const answer = await TarotService.initializeTechTarotSessionFor(this.username);
                    this.chatClient.send(answer)
                }
                break;
            case 'session_keepalive':
                console.log("session_keepalive received");
                break;
            default:
        }
    }
}
