import {CBWebSocket} from "./src/CBWebSocket";
import {configDotenv} from "dotenv";

configDotenv({path: ".env"})
const socket = new CBWebSocket("thecodingbuddies");
