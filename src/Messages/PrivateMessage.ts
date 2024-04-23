import {ConfigStorage} from "../Config/ConfigStorage";
import {PlaceHolderTransformer} from "./PlaceHolderTransformer";

export class PrivateMessage implements Message {
    username: string;
    botName: string;
    author: string;
    channel: string;
    content: string;

    constructor(message: string) {
        try {
            let parts: string[] = message.split(' ');
            let content = parts.slice(3).join(' ');
            this.username = PrivateMessage.extractUsernameFrom(parts[0]);
            this.author = this.username;
            this.channel = parts[2].slice(1);
            this.content = content.slice(1);
            this.botName = process.env.NICKNAME;
        } catch (e) {
            throw new Error("Message incomplete");
        }
    }

    private static extractUsernameFrom(fullName: string): string {
        return fullName.split("!")[0].slice(1);
    }

    answer(): string {
        ConfigStorage.timeoutList.update();
        const foundCommand = ConfigStorage.getCommands()
            .find(command => command.name === this.content.toLowerCase());
        let answer: string = "";
        if (!!foundCommand) {
            if (!ConfigStorage.timeoutList.hasTimeout(foundCommand, this.username)) {
                let transformer = new PlaceHolderTransformer(foundCommand.response, this.author);
                const response = transformer.transform();
                answer = `:${this.botName} PRIVMSG #${this.channel} :${response}`;
                ConfigStorage.timeoutList.add(foundCommand, this.username);
            }
        }
        return answer;
    }
}
