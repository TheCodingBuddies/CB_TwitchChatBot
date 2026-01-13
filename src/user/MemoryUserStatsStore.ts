import {UserStats, UserStatsStore} from "./UserStatsStore";

export class MemoryUserStatsStore implements UserStatsStore {
    private readonly stats: Map<string, UserStats> = new Map<string, UserStats>();

    async updateStats(userId: string, updater: (stats: UserStats) => UserStats): Promise<UserStats> {
        const current = this.stats.get(userId) ?? {
            userId,
            messageCount: 0
        };
        const updatedStats = updater({...current});
        this.stats.set(userId, updatedStats);
        return updatedStats;
    }

    async getStats(userId: string): Promise<UserStats | null> {
        return this.stats.get(userId) ?? null;
    }

    async getAllStats(): Promise<UserStats[]> {
        return Array.from(this.stats.values());
    }

    async deleteStats(userId: string): Promise<void> {
        this.stats.delete(userId);
    }
}