import {MemoryUserStatsStore} from "../../src/User/MemoryUserStatsStore";

describe('MemoryUserStatsStore', () => {

    it('has no stats by default', async () => {
        const store = new MemoryUserStatsStore();
        const stats = await store.getAllStats();
        expect(stats).toEqual([]);
    });

    it('create new user stat if id not exists', async () => {
        const store = new MemoryUserStatsStore();
        const stats = await store.updateStats('test-user', (stats) => ({
            ...stats,
            messageCount: 5,
        }));
        expect(stats).toEqual({userId: 'test-user', messageCount: 5,});
    });

    it('update user stat if exists', async () => {
        const store = new MemoryUserStatsStore();
        await store.updateStats('test-user', (stats) => ({
            ...stats,
            messageCount: stats.messageCount + 2,
        }));
        const stats = await store.updateStats('test-user', (stats) => ({
            ...stats,
            messageCount: stats.messageCount + 2,
        }));
        expect(stats).toEqual({userId: 'test-user', messageCount: 4});
    });

    it('get specific user stat', async () => {
        const store = new MemoryUserStatsStore();
        await store.updateStats('test-user-1', (stats) => ({
            ...stats,
            messageCount: 1,
        }));
        await store.updateStats('test-user-2', (stats) => ({
            ...stats,
            messageCount: 1,
        }));
        const user1Stats = await store.getStats('test-user-1');
        expect(user1Stats).toEqual({userId: 'test-user-1', messageCount: 1,});
    });

    it('get nothing for non existing user stat', async () => {
        const store = new MemoryUserStatsStore();
        expect(await store.getStats('not-existing')).toBeNull();
    });

    it('deletes user stat', async () => {
        const store = new MemoryUserStatsStore();
        await store.updateStats('test-user', (stats) => ({
            ...stats,
            messageCount: 1,
        }));
        await store.updateStats('test-user-2', (stats) => ({
            ...stats,
            messageCount: 1,
        }));
        await store.deleteStats('test-user');

        expect(await store.getAllStats()).toEqual([{userId: 'test-user-2', messageCount: 1}]);
    });
});