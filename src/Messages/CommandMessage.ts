import {ConfigStorage} from "../Config/ConfigStorage";
import {PlaceHolderTransformer} from "./PlaceHolderTransformer";
import {Command} from "../Config/CommandParser";
import {PrivateMessage} from "./PrivateMessage";
import {RawMessage} from "./RawMessage";

export class CommandMessage implements Message {
    username: string;
    botName: string;
    author: string;
    channel: string;
    content: string;

    constructor(message: RawMessage) {
        try {
            this.username = message.content.prefix.nickname;
            this.author = this.username;
            this.channel = message.content.channel;
            this.content = message.content.message;
            this.botName = process.env.NICKNAME;
        } catch (e) {
            throw new Error("Message incomplete");
        }
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
