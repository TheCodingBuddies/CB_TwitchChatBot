import { VotingService } from "../Voting/VotingService";

enum VoteType {
    START_DEFAULT_VOTE,
    START_VOTE,
    VOTE_DEFAULT,
    VOTE,
    UNKNOWN
}

export class VoteMessage implements Message {
    votingUsername: string;
    command: string = "";
    sessionName: string;
    options: string[];
    type: VoteType = VoteType.UNKNOWN;

    readonly START_DEFAULT_VOTE_PATTERN = /^!vote-start \[\w+(,\s?\w+)*\]$/;
    readonly START_VOTE_PATTERN = /^!vote-start (\w+|"\w+(\s\w+)*") \[\w+(,\s?\w+)*\]$/;
    readonly VOTE_DEFAULT_PATTERN = /^!vote \w+$/;
    readonly VOTE_PATTERN = /^!vote (\w+|"\w+(\s\w+)*") \w+$/;

    /*
        ToDo:
        - help answer on wrong vote commands?
        - highlight vote name
        - Make Vote duration configurable
        - only host is able to start vote? (and mods?)
     */
    constructor(message: string) {
        this.type = this.getType(message);
        if (this.type === VoteType.UNKNOWN)
            return;
        let parts: string[] = message.match(/("[^"]+"|\[[^\]]+\]|\S+)/g);
        this.votingUsername = VoteMessage.extractUsername(parts[0]);
        this.command = VoteMessage.extractCommand(parts);
        this.sessionName = this.extractSessionName(parts);
        if (this.isStartVoteType()) {
            this.options = this.extractVoteOptions(parts);
            VotingService.start(this.sessionName, 60000, this.options);
        } else {
            const option: string = this.extractChooseOption(parts);
            VotingService.vote(this.votingUsername, this.sessionName, option);
        }
    }

    private static extractCommand(parts: string[]) {
        return parts[3].slice(1);
    }

    private static extractUsername(part: string) {
        return part.split("!")[0].slice(1);
    }

    answer(): string {
        if (this.type === VoteType.UNKNOWN) {
            return "";
        }
        const chatBotResponse: string = (this.sessionName !== "default") ? `${this.sessionName} started` : "started";
        return (this.isStartVoteType())
            ? `:${process.env.TWITCH_BOT_USERNAME} PRIVMSG #${process.env.TWITCH_CHANNEL_NAME} :Voting ${chatBotResponse}! Options are ${this.options}`
            : "";
    }

    private extractVoteOptions(parts: string[]): string[] {
        const optionsIdx = (this.type === VoteType.START_VOTE) ? 5 : 4;
        return parts[optionsIdx].slice(1, parts[optionsIdx].length - 1).split(",").map(ops => ops.trim());
    }

    private extractChooseOption(parts: string[]) {
        const optionsIdx = (this.type === VoteType.VOTE) ? 5 : 4;
        return parts[optionsIdx];
    }

    private extractSessionName(parts: string[]) {
        return (this.type === VoteType.VOTE
            || this.type === VoteType.START_VOTE)
            ? parts[4] : "default";
    }

    private getType(message: string): VoteType {
        const parts = message.split(" ");
        const voteMessage = parts.splice(3).join(" ").slice(1);
        if (this.START_DEFAULT_VOTE_PATTERN.test(voteMessage))
            return VoteType.START_DEFAULT_VOTE;
        if (this.START_VOTE_PATTERN.test(voteMessage))
            return VoteType.START_VOTE;
        if (this.VOTE_DEFAULT_PATTERN.test(voteMessage))
            return VoteType.VOTE_DEFAULT;
        if (this.VOTE_PATTERN.test(voteMessage))
            return VoteType.VOTE;
        return VoteType.UNKNOWN;
    }

    private isStartVoteType(): boolean {
        return (this.type === VoteType.START_DEFAULT_VOTE
            || this.type === VoteType.START_VOTE);
    }
}
