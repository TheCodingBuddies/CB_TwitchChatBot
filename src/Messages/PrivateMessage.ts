export class PrivateMessage {
    readonly content: string;

    constructor(message: string) {
        this.content = `:${process.env.TWITCH_BOT_USERNAME} PRIVMSG #${process.env.TWITCH_CHANNEL_NAME} :${message}`;
    }
}
