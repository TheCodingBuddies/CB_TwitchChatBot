import {VotingService} from "../Voting/VotingService";
import {RawMessage} from "./RawMessage";

enum VoteType {
    START_DEFAULT_VOTE,
    START_VOTE,
    VOTE_DEFAULT,
    VOTE,
    VOTE_CANCEL,
    UNKNOWN
}

export class VoteMessage implements Message {
    votingUsername: string;
    voteCommand: string = "";
    sessionName: string;
    options: string[];
    type: VoteType = VoteType.UNKNOWN;
    votingDurationSec: number = 60;

    readonly START_DEFAULT_VOTE_PATTERN =  /^!vote-start\s+(\d+)\s+\[[^\]]+\]\s*$/;
    readonly START_COMPLETE_VOTE_PATTERN = /^!vote-start\s+("[^"]+"|\S+)\s+(\d+)\s+\[[^\]]+\]\s*$/;
    readonly VOTE_DEFAULT_PATTERN = /^!vote \w+$/;
    readonly VOTE_PATTERN = /^!vote (\w+|"\w+(\s\w+)*") \w+$/;
    readonly VOTE_CANCEL_PATTERN = /^!vote-cancel$/;

    /*
        ToDo:
        - help answer on wrong vote commands?
        - highlight vote name
        - Make Vote duration configurable
        - only host is able to start vote? (and mods?)
        - vote-like -> ein anderer user
     */
    constructor(message: RawMessage) {
        let parts: string[] = message.content.message.match(/("[^"]+"|\[[^\]]+\]|\S+)/g);
        this.votingUsername = message.content.prefix.nickname;
        this.voteCommand = parts[0];
        this.type = this.getType(message.content.message);
        this.sessionName = this.extractSessionName(parts).replace(/"/g, "");

        if (this.type === VoteType.UNKNOWN) {
            return;
        }
        if (this.isAuthorized() && this.type === VoteType.VOTE_CANCEL) {
            VotingService.cancelVote();
            return;
        }
        if (this.isStartVoteType()) {
            this.votingDurationSec = this.extractVoteDuration(parts);
            this.options = this.extractVoteOptions(parts);
            VotingService.start(this.sessionName, this.votingDurationSec * 1000, this.options);
        } else {
            const option: string = this.extractChooseOption(parts);
            VotingService.vote(this.votingUsername, option);
        }
    }

    async answer(): Promise<string> {
        if (this.type === VoteType.UNKNOWN) {
            return "";
        }
        const chatBotResponse: string = (this.sessionName !== "Aktives Voting läuft") ? `"${this.sessionName}" started` : "started";
        return this.isStartVoteType()
            ? `:${process.env.NICKNAME} PRIVMSG #${process.env.CHANNEL} :Voting ${chatBotResponse}! Optionen sind ${this.options}`
            : "";
    }

    private extractVoteOptions(parts: string[]): string[] {
        const optionsIdx = (this.type === VoteType.START_VOTE) ? 3 : 2;
        return parts[optionsIdx].slice(1, parts[optionsIdx].length - 1).split(",").map(ops => ops.trim());
    }

    private extractChooseOption(parts: string[]) {
        const optionsIdx = (this.type === VoteType.VOTE) ? 2 : 1;
        return parts[optionsIdx];
    }

    private extractVoteDuration(parts:string[]): number {
        const optionIdx = (this.type === VoteType.START_VOTE) ? 2 : 1;
        return parseInt(parts[optionIdx]);
    }

    private extractSessionName(parts: string[]) {
        return (this.type === VoteType.VOTE
            || this.type === VoteType.START_VOTE)
            ? parts[1] : "Aktives Voting läuft";
    }

    private getType(voteMessage: string): VoteType {
        if (this.VOTE_CANCEL_PATTERN.test(voteMessage))
            return VoteType.VOTE_CANCEL;
        if (this.START_DEFAULT_VOTE_PATTERN.test(voteMessage))
            return VoteType.START_DEFAULT_VOTE;
        if (this.START_COMPLETE_VOTE_PATTERN.test(voteMessage))
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

    private isAuthorized(): boolean {
        return this.votingUsername === process.env.NICKNAME;
    }
}
