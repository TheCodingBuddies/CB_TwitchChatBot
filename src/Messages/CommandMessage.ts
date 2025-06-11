import { Command } from "../Config/CommandParser";
import { ConfigStorage } from "../Config/ConfigStorage";
import { PlaceHolderTransformer } from "./PlaceHolderTransformer";
import { PrivateMessage } from "./PrivateMessage";

export class CommandMessage implements Message {
    username: string;
    botName: string;
    author: string;
    channel: string;
    content: string;

    constructor(message: string) {
        try {
            let parts: string[] = message.split(' ');
            let content = parts.slice(3).join(' ');
            this.username = CommandMessage.extractUsernameFrom(parts[0]);
            this.author = this.username;
            this.channel = parts[2].slice(1);
            this.content = content.slice(1);
            this.botName = process.env.TWITCH_BOT_USERNAME;
        } catch (e) {
            throw new Error("Message incomplete");
        }
    }

    private static extractUsernameFrom(fullName: string): string {
        return fullName.split("!")[0].slice(1);
    }

    answer(): string {
        ConfigStorage.timeoutList.update();
        const foundCommand: Command = ConfigStorage.getCommands()
            .find(command => command.name.split(' ')[0] === this.content.toLowerCase().split(' ')[0]);
        let answer: string = "";
        if (foundCommand) {
            let transformer = new PlaceHolderTransformer(this.author);
            try {
                transformer.extractParams(this.content, foundCommand.name);
                if (!ConfigStorage.timeoutList.hasTimeout(foundCommand, this.username)) {
                    const response = transformer.transform(foundCommand.response);
                    answer = new PrivateMessage(response).content;
                    ConfigStorage.timeoutList.add(foundCommand, this.username);
                }
            } catch (e) {

            }
        }
        return answer;
    }
}
