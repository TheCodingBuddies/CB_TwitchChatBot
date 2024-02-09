export class UnknownMessage implements Message {
    answer(): string {
        console.log("unknown message -> rejected");
        return "";
    }
}
