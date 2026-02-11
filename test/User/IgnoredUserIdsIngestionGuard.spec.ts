import {IgnoredUserIdsIngestionGuard} from "../../src/User/IgnoredUserIdsIngestionGuard";

describe('IgnoredUserIdsIngestionGuard', () => {
    let ignoredUserIdsIngestionGuard: IgnoredUserIdsIngestionGuard;
    beforeEach(() => {
        process.env.NICKNAME = 'ownName';
        ignoredUserIdsIngestionGuard = new IgnoredUserIdsIngestionGuard();
    })

    it.each(['tmi.twitch.tv', 'ownName', 'ownName.tmi.twitch.tv'])
    ('does not track user id: %s', (userId: string) => {
        expect(ignoredUserIdsIngestionGuard.shouldTrack(userId)).toBeFalsy();
    });

    it('should tracks a valid user id', () => {
        expect(ignoredUserIdsIngestionGuard.shouldTrack('aTwitchUser')).toBeTruthy();
    });
})