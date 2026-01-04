import EventEmitter from "events";
import {VotingApi} from "./VotingApi";
import {clearTimeout} from "node:timers";

export interface VoteOption {
    name: string,
    count: number
}

interface VoteSession {
    name: string,
    duration: number,
    options: VoteOption[],
    timeout: NodeJS.Timeout,
    participants: string[]
}

export class VotingService {

    static activeVoteSession: VoteSession;
    static readonly REMINDER_20_SECS = 20_000;
    static recentResult: EventEmitter = new EventEmitter();
    static voteReminder: EventEmitter = new EventEmitter();

    static vote(user: string, choseOption: string) {
        if (this.activeVoteSession) {
            const hasAlreadyVoted = this.activeVoteSession.participants.some(p => p === user)
            if (hasAlreadyVoted)
                return;
            let option: VoteOption = this.activeVoteSession.options.find(option => option.name === choseOption);
            if (option) {
                option.count++;
                this.activeVoteSession.options = this.activeVoteSession.options.sort((a, b) => a.count > b.count ? -1 : (a.count < b.count) ? 1 : 0);
                this.activeVoteSession.participants.push(user);
                VotingApi.updateOptions(this.activeVoteSession.options).then()
            }
        }
    }

    static start(id: string, durationInMs: number, options: string[]): void {
        if (this.activeVoteSession) {
            return;
        }
        const reminderTime = durationInMs - this.REMINDER_20_SECS;

        setTimeout(() => {
            this.onFinish(id);
        }, durationInMs);

        let reminderTimeout: NodeJS.Timeout;
        if (durationInMs > 20_000) {
            reminderTimeout = setTimeout(() => {
                this.remindToVote(id);
            }, reminderTime);
        }

        const voteOptions: VoteOption[] = options.map(o => ({name: o, count: 0}));
        this.activeVoteSession = {
            name: id,
            duration: durationInMs,
            options: voteOptions,
            timeout: reminderTimeout,
            participants: []
        }
        VotingApi.startVoteOverlay(id, durationInMs / 1000, this.activeVoteSession.options).then()
    }

    static remindToVote(id: string) {
        const remindMessage = `Voting Session "${id}" endet in 20 Sekunden!`;
        this.voteReminder.emit("VoteReminder", remindMessage);
    }

    static isActive(): boolean {
        return !!this.activeVoteSession;
    }

    static cancelVote() {
        if (this.activeVoteSession) {
            clearTimeout(this.activeVoteSession.timeout);
            this.activeVoteSession = undefined;
        }
        VotingApi.cancelVoteOverlay().then();
    }

    private static onFinish(id: string): void {
        if (!this.activeVoteSession) {
            return;
        }
        clearTimeout(this.activeVoteSession.timeout);
        this.recentResult.emit("lastVoteResult", this.summaryOf(id, this.activeVoteSession));
        this.activeVoteSession = undefined;
    }

    private static summaryOf(id: string, session: VoteSession): string {
        const summaryMessage: string = (id !== "Aktives Voting läuft") ? `Voting "${id}" beendet` : `Voting beendet`;
        const allVotes = session.participants.length;
        let distribution: string = "Es gab keine Stimmen";
        if (allVotes !== 0) {
            distribution = session.options.map(o => `${Math.round(o.count / allVotes * 100)}% für ${o.name}`).join(", ");
        }
        return `${summaryMessage}! Option ${session.options[0].name} hat gewonnen! ${distribution}.`
    }
}
