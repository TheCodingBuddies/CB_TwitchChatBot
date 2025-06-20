export const PRIVMSG: string = "PRIVMSG";
export const NOTICE: string = "NOTICE";
export const JOIN: string = "JOIN";
export const PART: string = "PART";
export const PING: string = "PING";
export const PONG: string = "PONG";

interface IrcMessage {
    raw: string;
    tags?: Record<string, string>;
    prefix?: UserPrefix;
    command: string;
    channel?: string;
    message?: string;
}

interface UserPrefix {
    nickname: string;
    username: string;
    hostname: string;
}

export class RawMessage {
    content: IrcMessage;

    constructor(rawData: string) {
        this.content = this.parse(rawData);
    }

    private parse(rawData: string): IrcMessage {
        const result: IrcMessage = {raw: rawData, command: ""};
        let rest = rawData;

        rest = this.extractTags(rest, result);
        rest = this.extractPrefix(rest, result);
        rest = this.extractCommand(rest, result);
        rest = this.extractChannel2(result, rest);
        this.extractMessage(result, rest);

        return result;
    }

    private extractMessage(result: IrcMessage, rest: string) {
        if (this.hasMessage(result) && rest.startsWith(":")) {
            result.message = rest.slice(1);
        }
    }

    private extractChannel2(result: IrcMessage, rest: string) {
        if (this.hasChannel(result)) {
            const spaceIdx = rest.indexOf(" ");
            if (spaceIdx !== -1) {
                const channelPart = rest.slice(0, spaceIdx);
                result.channel = channelPart.replace(/^#/, "");
                rest = rest.slice(spaceIdx + 1);
            }
        }
        return rest;
    }

    private hasChannel(result: IrcMessage): boolean {
        return result.command === PRIVMSG
            || result.command === NOTICE
            || result.command === JOIN
            || result.command === PART;
    }

    private hasMessage(result: IrcMessage): boolean {
        return result.command === PRIVMSG
            || result.command === NOTICE;
    }

    private extractCommand(rest: string, result: IrcMessage): string {
        const commandMatch = rest.match(/^(\S+)/);
        if (!commandMatch) throw new Error("No command found");
        result.command = commandMatch[1];
        return rest.slice(commandMatch[0].length + 1);
    }

    private extractPrefix(rest: string, result: IrcMessage): string {
        if (rest.startsWith(":")) {
            const endIdx = rest.indexOf(" ");
            const prefixPart = rest.slice(1, endIdx);
            rest = rest.slice(endIdx + 1);

            const [nickname, userHost] = prefixPart.split("!");
            const [username, hostname] = userHost?.split("@") ?? [];

            result.prefix = {
                nickname: nickname,
                username: username,
                hostname: hostname
            };
        }
        return rest;
    }

    private extractTags(rest: string, result: IrcMessage): string {
        if (rest.startsWith("@")) {
            const endIndex = rest.indexOf(" ");
            const tagPart = rest.slice(1, endIndex);
            rest = rest.slice(endIndex + 1);

            result.tags = Object.fromEntries(
                tagPart.split(";").map(tag => {
                    const [key, val] = tag.split("=");
                    return [key, val ?? ""];
                })
            );
        }
        return rest;
    }
}