import {configDotenv} from "dotenv";
import {ChatBot} from "./src/ChatBot";
import {TokenUpdater} from "./src/Auth/TokenUpdater";

async function run() {
    configDotenv({path: ".env"})
    const tokenData = await TokenUpdater.initializeTokenData();
    TokenUpdater.scheduleAutoRefresh(tokenData);
    new ChatBot().start();
}

run();