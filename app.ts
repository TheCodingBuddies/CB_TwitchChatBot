import {configDotenv} from "dotenv";
import {ChatBot} from "./src/ChatBot";

configDotenv({path: ".env"})
const chatBot = new ChatBot();

