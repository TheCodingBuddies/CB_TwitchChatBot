import {VotingService} from "../Voting/VotingService";

export class VoteMessage implements Message {
    votingUsername: string
    command: string
    sessionName: string
    options: string[]

    /*
        ToDo:
        - remind vote session is nearly over
        - Make Vote duration configurable
        - only host is able to start vote? (and mods?)
     */
    constructor(message: string) {
        let parts: string[] = message.split(' ');
        try {
            this.votingUsername = VoteMessage.extractUsername(parts[0]);
            this.command = VoteMessage.extractCommand(parts);
            this.sessionName = parts[4];
            if (this.tryToStartVote()) {
                this.options = VoteMessage.extractVoteOptions(parts);
                VotingService.start(this.sessionName, 60000, this.options);
            } else {
                VotingService.vote(this.votingUsername, this.sessionName, parts[5]);
            }
        } catch (err) {
            this.command = "";
        }
    }

    answer(): string {
        return (this.tryToStartVote())
            ? `:${process.env.NICKNAME} PRIVMSG #${process.env.CHANNEL} :Voting ${this.sessionName} started! Options are ${this.options}`
            : "";
    }

    private static extractVoteOptions(parts: string[]) {
        return parts[5].trim().slice(1, parts[5].length - 1).split(",");
    }

    private static extractCommand(parts: string[]) {
        return parts[3].slice(1);
    }

    private static extractUsername(part: string) {
        return part.split("!")[0].slice(1);
    }

    private tryToStartVote(): boolean {
        return this.command === "!vote-start";
    }
}
