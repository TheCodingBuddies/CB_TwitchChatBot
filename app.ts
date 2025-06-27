import {configDotenv} from "dotenv";
import {ChatBot} from "./src/ChatBot";
import * as tokenManager from "./src/Auth/TokenUpdater";

async function run() {
    configDotenv({path: ".env"})
    const tokenData = await tokenManager.initializeTokenData();
    tokenManager.scheduleAutoRefresh(tokenData);
    new ChatBot().start();
}

run();