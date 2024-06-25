import EventEmitter from "events";

export interface VoteOption {
    name: string,
    count: number
}

interface VoteSession {
    duration: number,
    options: VoteOption[],
    interval: NodeJS.Timeout,
    participants: string[]
}

export class VotingService {

    static sessions: Map<string, VoteSession> = new Map<string, VoteSession>();
    static readonly REMINDER_COUNT = 4;
    static recentResult: EventEmitter = new EventEmitter();

    static vote(user: string, id: string, choseOption: string) {
        const session: VoteSession = this.sessions.get(id);
        if (session) {
            const hasAlreadyVoted = session.participants.some(p => p === user)
            if (hasAlreadyVoted)
                return;
            let option = session.options.find(option => option.name === choseOption);
            if (option) {
                option.count++;
                session.options = session.options.sort((a, b) => a.count > b.count ? -1 : (a.count < b.count) ? 1 : 0);
                session.participants.push(user);
            }
        }
    }

    static start(id: string, duration: number, options: string[]): void {
        const reminderTime = duration / this.REMINDER_COUNT;

        setTimeout(() => {
            this.onFinish(id);
        }, duration);

        const interval: NodeJS.Timeout = setInterval(() => {
            this.remindToVote();
        }, reminderTime);

        const voteOptions: VoteOption[] = options.map(o => ({name: o, count: 0}));
        this.sessions.set(id, {duration: duration, options: voteOptions, interval: interval, participants: []});
    }

    static remindToVote() {
        /* ToDo: send reminder with client */
    }

    static isActive(id: string): boolean {
        return this.sessions.has(id);
    }

    private static onFinish(id: string): void {
        let session = this.sessions.get(id);
        if (session) {
            clearInterval(session.interval);
            this.sessions.delete(id);
            this.recentResult.emit("lastVoteResult", this.summaryOf(id, session));
        }
    }

    private static summaryOf(id: string, session: VoteSession): string {
        const summaryMessage: string = (id !== "default") ? `Voting ${id} beendet` : `Voting beendet`
        return `${summaryMessage}! Option ${session.options[0].name} hat gewonnen!`
    }
}
