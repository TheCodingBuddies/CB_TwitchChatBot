import WebSocket, {RawData} from "ws"
import {TokenUpdater} from "./Auth/TokenUpdater";
import assert from "node:assert";
import axios from "axios";
import {SubscriptionEvent} from "./SubscriptionEvents/SubscriptionEvent";

export class CBEventWebsocket {

    readonly TWITCH_EVENT_CHANNEL = "wss://eventsub.wss.twitch.tv/ws";
    private client: WebSocket;
    channel: string;
    readonly token: string;
    useCapabilities: boolean;
    connected: boolean = false;

    constructor(channel: string, useCapabilities: boolean) {
        this.client = new WebSocket(this.TWITCH_EVENT_CHANNEL);
        this.channel = channel;
        this.useCapabilities = useCapabilities;
        this.token = TokenUpdater.loadTokenData().access_token;
        this.client.on("open", this.handleOpenConnection.bind(this));
        this.client.on("message", this.onMessage.bind(this));
    }

    private handleOpenConnection() {
        console.log("event websocket opened");
        this.connected = true;
    }

    private onMessage(data: RawData) {
        const json = JSON.parse(data.toString());
        assert(json.metadata, 'no metadata in event');
        switch (json.metadata.message_type) {
            case 'session_welcome':
                const CustomRewardEvent: SubscriptionEvent = {
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
                axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', CustomRewardEvent, {
                    headers: {
                        "Content-Type": "application/json",
                        "Client-Id": process.env.CLIENT_ID,
                        "Authorization": `Bearer ${process.env.USER_ACCESS_TOKEN}`
                    }
                }).then(r => {
                    console.log(r.status);
                });
                break;
            case 'session_reconnect':
                console.log("session_reconnect received");
                break;
            case 'notification':
                if (json.payload.event.reward.title === "Tech Tarot")
                    console.log("Paid for Tech Tarot!");
                break;
            case 'session_keepalive':
                console.log("session_keepalive received");
                break;
            default:
        }


    }
}
