export class UnknownMessage implements Message {

    private readonly content: string;

    constructor(rawMessage: string) {
        this.content = rawMessage;
    }

    answer(): string {
        console.log(`${this.content} is unknown --> rejected`);
        return "";
    }
}
