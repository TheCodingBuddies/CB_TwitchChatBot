export class IgnoredUserIdsIngestionGuard {
    private readonly ignoredIds: Set<string>;

    constructor() {
        this.ignoredIds = new Set(
            ["tmi.twitch.tv", process.env.NICKNAME, `${process.env.NICKNAME}.tmi.twitch.tv`,]
                .filter((id): id is string => !!id && id.trim().length > 0)
                .map((id) => id.toLowerCase())
        );
    }

    shouldTrack(userId: string): boolean {
        if (!userId) {
            return false;
        }
        return !this.ignoredIds.has(userId.toLowerCase());
    }
}