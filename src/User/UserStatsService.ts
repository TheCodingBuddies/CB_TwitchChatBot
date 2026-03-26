import {UserStatsStore, UserStats} from "./UserStatsStore";
import {IgnoredUserIdsIngestionGuard} from "./IgnoredUserIdsIngestionGuard";

export type CreditCategory = {
    title: string;
    names: string[];
};

export class UserStatsService {
    userGuard: IgnoredUserIdsIngestionGuard = new IgnoredUserIdsIngestionGuard()
    constructor(private readonly store: UserStatsStore) {}

    async countMessage(userId: string): Promise<UserStats> {
        if (this.userGuard.shouldTrack(userId)) {
            return this.store.updateStats(userId, (stats) => ({
                ...stats,
                messageCount: stats.messageCount + 1,
            }));
        }
    }

    async markRaid(userId: string): Promise<UserStats> {
        return this.store.updateStats(userId, (stats) => ({
            ...stats,
            raided: true,
        }));
    }

    async getStatsFor(userId: string): Promise<UserStats | null> {
        return this.store.getStats(userId);
    }

    async getAllStats(): Promise<UserStats[]> {
        return this.store.getAllStats();
    }

    async getCredits(): Promise<CreditCategory[]> {
        let credits: CreditCategory[] = [];
        const stats = await this.getAllStats();
        let chatterNames: string[] = stats.slice()
            .sort((a,b)=> b.messageCount - a.messageCount)
            .filter(entry => entry.messageCount > 0)
            .slice(0, 10)
            .map(entry => entry.userId);
        credits.push({title: `Die ${Math.min(chatterNames.length, 10)} stärksten Chatter`, names: chatterNames});
        let raiderNames: string[] = stats.slice()
            .filter(entry => entry.raided)
            .map(entry => entry.userId);
        credits.push({title: `Danke für eure Raids`, names: raiderNames});

        return credits;

    }

    async deleteStats(userId: string): Promise<void> {
        await this.store.deleteStats(userId);
    }
}