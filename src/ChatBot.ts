import {CommandStorage} from "./Commands/CommandStorage";
import {PeriodicStorage} from "./Periodic/PeriodicStorage";
import {CBEventWebsocket} from "./CBEventWebsocket";
import {CBChatWebsocket} from "./CBChatWebsocket";
import {UserStatsService} from "./User/UserStatsService";
import {MemoryUserStatsStore} from "./User/MemoryUserStatsStore";
import {createStatsHttpServer} from "./http/StatsController";

export class ChatBot {

    constructor() {
        try {
            CommandStorage.loadConfig();
            PeriodicStorage.loadConfig();
        } catch (error) {
            console.error(error.message);
            process.exit(-1);
        }
    }

    start() {
        const userStatsService = new UserStatsService(new MemoryUserStatsStore());
        createStatsHttpServer(userStatsService).listen(process.env.STATS_PORT ?? 4000)
        const ircChatWs = new CBChatWebsocket(process.env.TWITCH_CHANNEL_NAME, userStatsService, true);
        new CBEventWebsocket(process.env.TWITCH_CHANNEL_NAME, ircChatWs.client, userStatsService);
    }
}
