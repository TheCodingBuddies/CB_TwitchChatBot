export class PrivateMessage {
    readonly content: string;

    constructor(message: string) {
        this.content = `:${process.env.NICKNAME} PRIVMSG #${process.env.CHANNEL} :${message}`;
    }
}
