export class UnknownMessage implements Message {

    private readonly content: string;

    constructor(rawMessage: string) {
        this.content = rawMessage;
    }

    async answer(): Promise<string> {
        console.log(`${this.content} is unknown --> rejected`);
        return "";
    }
}
