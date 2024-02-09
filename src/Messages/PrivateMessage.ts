export class PrivateMessage implements Message {
    username: string;
    channel: string;
    content: string;

    constructor(message: string) {
        try {
            let parts: string[] = message.split(' ');
            let content = parts.slice(3).join(' ');
            this.username = PrivateMessage.extractUsernameFrom(parts[0]);
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
        this.username = process.env.NICKNAME;
        return this.getAnswer();
    }

    private getAnswer(): string {
        let answer: string = "";
        if (this.isDcCommand()) {
            this.content = `${process.env.DISCORD}`;
            answer = `:${this.username} PRIVMSG #${this.channel} :${this.content}`;
        }
        return answer;
    }

    private isDcCommand(): boolean {
        return this.content == '!dc';
    }
}
