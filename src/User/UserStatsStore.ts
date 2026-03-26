
export interface UserStats {
    userId: string;
    messageCount: number;
    raided: boolean;
}

export interface UserStatsStore {
    updateStats(userId: string, updater: (stats: UserStats) => UserStats): Promise<UserStats>;
    getStats(userId: string): Promise<UserStats | null>;
    getAllStats(): Promise<UserStats[]>;
    deleteStats(userId: string): Promise<void>;
}