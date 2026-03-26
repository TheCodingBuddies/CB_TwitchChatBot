import WebSocket, {RawData} from "ws"
import assert from "node:assert";
import {SubscriptionEvent} from "./SubscriptionEvents/SubscriptionEvent";
import {TarotService} from "./Tarot/TarotService";
import {TwitchApi} from "./Auth/TwitchApi";
import {UserStatsService} from "./User/UserStatsService";

const RAID_CHANNEL_SUB_TYPE: string = "channel.raid";
const CUSTOM_REWARD_SUB_TYPE: string = "channel.channel_points_custom_reward_redemption.add";

export class CBEventWebsocket {

    readonly TWITCH_EVENT_CHANNEL = "wss://eventsub.wss.twitch.tv/ws";
    private client: WebSocket;
    channel: string;
    chatClient: WebSocket;
    connected: boolean = false;
    username: string = "";
    userStatsService: UserStatsService;

    constructor(channel: string, chatClient: WebSocket, userStatsService: UserStatsService) {
        this.chatClient = chatClient;
        this.client = new WebSocket(this.TWITCH_EVENT_CHANNEL);
        this.channel = channel;
        this.userStatsService = userStatsService;
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
                const sessionId: string = json.payload.session.id;
                await this.subscribeToCustomRewards(sessionId);
                await this.subscribeToRaidEvent(sessionId);
                break;
            case 'session_reconnect':
                console.log("session_reconnect received");
                break;
            case 'notification':
                const subscriptionType: string | undefined = json?.payload?.subscription?.type;

                if (subscriptionType === RAID_CHANNEL_SUB_TYPE) {
                    const event = json.payload.event;
                    const raiderUsername = event.from_broadcaster_user_login;
                    const raiderNick = event.from_broadcaster_user_name;
                    const viewers = event.viewers;
                    await this.userStatsService.markRaid(raiderNick)
                    break;
                }

                if (subscriptionType === CUSTOM_REWARD_SUB_TYPE) {
                    if (json.payload.event.reward.title === "Tech Tarot") {
                        this.username = json.payload.event.user_name;
                        const answer = await TarotService.initializeTechTarotSessionFor(this.username);
                        this.chatClient.send(answer)
                    }
                    break;
                }

                break;
            case 'session_keepalive':
                console.log("session_keepalive received");
                break;
            default:
        }
    }

    private async subscribeToRaidEvent(sessionId: string) {
        const raidEvent: SubscriptionEvent = {
            type: RAID_CHANNEL_SUB_TYPE,
            version: "1",
            condition: {
                to_broadcaster_user_id: process.env.BROADCASTER_ID,
            },
            transport: {
                method: "websocket",
                session_id: sessionId
            }
        }
        await TwitchApi.subscribeToChannel(raidEvent);
    }

    private async subscribeToCustomRewards(sessionId: string) {
        const customRewardEvent: SubscriptionEvent = {
            type: CUSTOM_REWARD_SUB_TYPE,
            version: "1",
            condition: {
                broadcaster_user_id: process.env.BROADCASTER_ID,
            },
            transport: {
                method: "websocket",
                session_id: sessionId
            }
        }
        await TwitchApi.subscribeToChannel(customRewardEvent);
    }
}
