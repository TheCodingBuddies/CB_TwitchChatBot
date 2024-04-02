import {ConfigStorage} from "../Config/ConfigStorage";

export class PrivateMessage implements Message {
    username: string;
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
        } catch (e) {
            throw new Error("Message incomplete");
        }
    }

    private static extractUsernameFrom(fullName: string): string {
        return fullName.split("!")[0].slice(1);
    }

    answer(): string {
        ConfigStorage.timeoutList.update();
        let answer: string = "";
        if (!ConfigStorage.timeoutList.hasTimeout(this.content.toLowerCase())) {
            this.username = process.env.NICKNAME;
            answer = this.getAnswer();
        }
        return answer;
    }

    private getAnswer(): string {
        const foundCommand = ConfigStorage.getCommands()
            .find(command => command.name === this.content.toLowerCase());
        let answer: string = "";
        if (!!foundCommand) {
            const response = this.replaceSender(foundCommand.response);
            answer = `:${this.username} PRIVMSG #${this.channel} :${response}`;
            ConfigStorage.timeoutList.add(foundCommand);
        }
        return answer;
    }

    private replaceSender(response: string): string {
        return response.replace('${sender}', this.author);
    }
}
