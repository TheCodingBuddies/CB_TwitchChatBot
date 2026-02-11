import {UserStatsService} from "../../src/User/UserStatsService";
import {MemoryUserStatsStore} from "../../src/User/MemoryUserStatsStore";

describe('UserStatsService', () => {
    it('counts messages for a user', async () => {
        const userStatsService = new UserStatsService(new MemoryUserStatsStore());
        await userStatsService.countMessage("test-user");
        await userStatsService.countMessage("test-user");
        expect(await userStatsService.getStatsFor("test-user")).toEqual({userId: 'test-user', messageCount: 2});
    });

    it('gets all stats', async () => {
        const userStatsService = new UserStatsService(new MemoryUserStatsStore());
        await userStatsService.countMessage("a-user");
        await userStatsService.countMessage("a-user");
        await userStatsService.countMessage("other-user");

        expect(await userStatsService.getAllStats()).toEqual([
            {userId: 'a-user', messageCount: 2},
            {userId: 'other-user', messageCount: 1}
        ]);
    });

    it('deletes stats', async () => {
        const userStatsService = new UserStatsService(new MemoryUserStatsStore());
        await userStatsService.countMessage("a-user");
        await userStatsService.countMessage("a-user");
        await userStatsService.countMessage("other-user");
        await userStatsService.deleteStats("a-user");

        expect(await userStatsService.getAllStats()).toEqual([
            {userId: 'other-user', messageCount: 1}
        ]);
    });

    it('gets credits with maximum of 15 chatter', async () => {
        const userStatsService = new UserStatsService(new MemoryUserStatsStore());
        countALotOfMessages(userStatsService);

        const credits = await userStatsService.getCredits();
        expect(credits.length).toEqual(1);
        expect(credits[0].title).toEqual(`Die 15 stärksten Chatter`);
        expect(credits[0].names.length).toEqual(15);
        expect(credits[0].names[0]).toEqual('user-20');
        expect(credits[0].names[14]).toEqual('user-6');
    });

    it('gets credits for less than the max ranks', async () => {
        const memoryUserStatsStore = new MemoryUserStatsStore();
        await memoryUserStatsStore.updateStats('user-1', (stats) => ({...stats, messageCount: 2}));
        await memoryUserStatsStore.updateStats('user-2', (stats) => ({...stats, messageCount: 3}));
        await memoryUserStatsStore.updateStats('user-3', (stats) => ({...stats, messageCount: 1}));
        const userStatsService = new UserStatsService(memoryUserStatsStore);

        const credits = await userStatsService.getCredits();
        expect(credits[0].title).toEqual(`Die 3 stärksten Chatter`);
        expect(credits[0].names.length).toEqual(3);
        expect(credits[0].names[0]).toEqual('user-2');
        expect(credits[0].names[1]).toEqual('user-1');
        expect(credits[0].names[2]).toEqual('user-3');


    });

    function countALotOfMessages(userStatsService: UserStatsService) {
        for (let i = 20; i > 0; i--) {
            for (let j = 0; j < i; j++) {
                userStatsService.countMessage(`user-${i}`);
            }
        }
    }
});