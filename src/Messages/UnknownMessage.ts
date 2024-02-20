export class UnknownMessage implements Message {

    private readonly rawMessage: string;

    constructor(rawMessage: string) {
        this.rawMessage = rawMessage;
    }

    answer(): string {
        console.log(`${this.rawMessage} is unknown --> rejected`);
        return "";
    }
}
