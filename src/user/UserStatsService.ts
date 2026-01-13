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

    async getStatsFor(userId: string): Promise<UserStats | null> {
        return this.store.getStats(userId);
    }

    async getAllStats(): Promise<UserStats[]> {
        return this.store.getAllStats();
    }

    async getCredits(): Promise<CreditCategory[]> {
        let credits: CreditCategory[] = [];
        const stats = await this.getAllStats();
        let names: string[] = stats.slice()
            .sort((a,b)=> b.messageCount - a.messageCount)
            .slice(0, 15)
            .map(entry => entry.userId);
        credits.push({title: `Die ${Math.min(names.length, 15)} stärksten Chatter`, names: names});

        return credits;

    }

    async deleteStats(userId: string): Promise<void> {
        await this.store.deleteStats(userId);
    }
}