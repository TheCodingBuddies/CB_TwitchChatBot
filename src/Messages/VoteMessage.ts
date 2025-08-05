import {VotingService} from "../Voting/VotingService";
import {RawMessage} from "./RawMessage";

enum VoteType {
    START_DEFAULT_VOTE,
    START_VOTE,
    VOTE_DEFAULT,
    VOTE,
    UNKNOWN
}

export class VoteMessage implements Message {
    votingUsername: string;
    voteCommand: string = "";
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
        - vote-like -> ein anderer user
     */
    constructor(message: RawMessage) {
        this.type = this.getType(message.content.message);
        if (this.type === VoteType.UNKNOWN)
            return;
        let parts: string[] = message.content.message.match(/("[^"]+"|\[[^\]]+\]|\S+)/g);
        this.votingUsername = message.content.prefix.nickname;
        this.voteCommand = parts[0];
        this.sessionName = this.extractSessionName(parts);
        if (this.isStartVoteType()) {
            this.options = this.extractVoteOptions(parts);
            VotingService.start(this.sessionName, 60000, this.options);
        } else {
            const option: string = this.extractChooseOption(parts);
            VotingService.vote(this.votingUsername, this.sessionName, option);
        }
    }

    async answer(): Promise<string> {
        if (this.type === VoteType.UNKNOWN) {
            return "";
        }
        const chatBotResponse: string = (this.sessionName !== "default") ? `${this.sessionName} started` : "started";
        return (this.isStartVoteType())
            ? `:${process.env.NICKNAME} PRIVMSG #${process.env.CHANNEL} :Voting ${chatBotResponse}! Options are ${this.options}`
            : "";
    }

    private extractVoteOptions(parts: string[]): string[] {
        const optionsIdx = (this.type === VoteType.START_VOTE) ? 2 : 1;
        return parts[optionsIdx].slice(1, parts[optionsIdx].length - 1).split(",").map(ops => ops.trim());
    }

    private extractChooseOption(parts: string[]) {
        const optionsIdx = (this.type === VoteType.VOTE) ? 2 : 1;
        return parts[optionsIdx];
    }

    private extractSessionName(parts: string[]) {
        return (this.type === VoteType.VOTE
            || this.type === VoteType.START_VOTE)
            ? parts[1] : "default";
    }

    private getType(voteMessage: string): VoteType {
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
