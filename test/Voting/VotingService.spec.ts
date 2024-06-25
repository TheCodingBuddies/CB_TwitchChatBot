import {VotingService} from "../../src/Voting/VotingService";

describe("VotingService", () => {

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        VotingService.recentResult.removeAllListeners();
    });

    it('started session is active', () => {
        const durationInMs = 60000;
        const sessionName = "firstSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
        tick(durationInMs - 1);

        expect(VotingService.isActive(sessionName)).toBeTruthy();
    });

    it('removes voting session after time is up', () => {
        const durationInMs = 60000;
        const sessionName = "firstSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
        tick(durationInMs);
        expect(VotingService.isActive(sessionName)).toBeFalsy();
    });

    it('started default session and wrote correct summary', () => {
        const durationInMs: number = 60000;
        VotingService.start("default", durationInMs, ["A", "B"]);
        tick(durationInMs);

        VotingService.recentResult.on("lastVoteResult", (res) => {
            expect(res).toEqual("Voting beendet! Option A hat gewonnen!");
        });

    });

    describe('Voting on specific sessions', () => {
        it('first option (A) wins the session without voting', () => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen!");
            });
            tick(durationInMs);
        });

        it('votes for option A after start Voting and A wins', () => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "firstSession", "A");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen!");
            });
            tick(durationInMs);
        });

        it('votes for option B after start Voting and B wins', () => {
            const durationInMs = 60000;
            const sessionName = "secondSession";
            VotingService.start(sessionName, durationInMs, ["A", "B"]);
            VotingService.vote("aUser", "secondSession", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting secondSession beendet! Option B hat gewonnen!");
            });
            tick(durationInMs);
        });

        it('votes for both options, first option voted wins', () => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("userB", "firstSession", "B");
            VotingService.vote("userA", "firstSession", "A");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option B hat gewonnen!");
            });
            tick(durationInMs);
        });

        it('votes for option C and A wins because C does not exist', () => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "firstSession", "A");
            VotingService.vote("aUser", "firstSession", "C");
            VotingService.vote("aUser", "firstSession", "C");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen!");
            });
            tick(durationInMs);
        });

        it('revoke vote if session not exits', () => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "notExistingSession", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen!");
            });
            tick(durationInMs);
        });

        it('does not vote twice for same user', () => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("userA", "firstSession", "A");
            VotingService.vote("userA", "firstSession", "A");
            VotingService.vote("userA", "firstSession", "A");
            VotingService.vote("userB", "firstSession", "B");
            VotingService.vote("userC", "firstSession", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option B hat gewonnen!");
            });
            tick(durationInMs);
        });
    });

    function startTestSession(durationInMs: number) {
        const sessionName = "firstSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
    }

    function tick(timeInMs: number) {
        jest.advanceTimersByTime(timeInMs);
    }
});
