import {VotingService} from "../../src/Voting/VotingService";
import DoneCallback = jest.DoneCallback;

describe("VotingService", () => {

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        VotingService.recentResult.removeAllListeners();
        VotingService.voteReminder.removeAllListeners();
    });

    it('started session is active', () => {
        const durationInMs = 60000;
        const sessionName = "firstSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
        jest.advanceTimersByTime(durationInMs - 1);

        expect(VotingService.isActive(sessionName)).toBeTruthy();
    });

    it('removes voting session after time is up', () => {
        const durationInMs = 60000;
        const sessionName = "firstSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
        jest.advanceTimersByTime(durationInMs + 1);
        expect(VotingService.isActive(sessionName)).toBeFalsy();
    });

    it('started default session and wrote correct summary', (done: DoneCallback) => {
        const durationInMs: number = 60000;
        VotingService.start("default", durationInMs, ["A", "B"]);
        tick(durationInMs);

        VotingService.recentResult.on("lastVoteResult", (res) => {
            expect(res).toEqual("Voting beendet! Option A hat gewonnen! Es gab keine Stimmen.");
            done();
        });

    });

    describe('Voting on specific sessions', () => {
        it('first option (A) wins the session without voting', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen! Es gab keine Stimmen.");
                done();
            });
            tick(durationInMs);
        });

        it('votes for option A after start Voting and A wins', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "firstSession", "A");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen! 100% für A, 0% für B.");
                done();
            });
            tick(durationInMs);
        });

        it('votes for option B after start Voting and B wins', (done: DoneCallback) => {
            const durationInMs = 60000;
            const sessionName = "secondSession";
            VotingService.start(sessionName, durationInMs, ["A", "B"]);
            VotingService.vote("aUser", "secondSession", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting secondSession beendet! Option B hat gewonnen! 100% für B, 0% für A.");
                done();
            });
            tick(durationInMs);
        });

        it('votes for both options, first option voted wins', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("userB", "firstSession", "B");
            VotingService.vote("userA", "firstSession", "A");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option B hat gewonnen! 50% für B, 50% für A.");
                done();
            });
            tick(durationInMs);
        });

        it('votes for option C and A wins because C does not exist', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "firstSession", "A");
            VotingService.vote("aUser", "firstSession", "C");
            VotingService.vote("aUser", "firstSession", "C");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen! 100% für A, 0% für B.");
                done();
            });
            tick(durationInMs);
        });

        it('revoke vote if session not exits', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "notExistingSession", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option A hat gewonnen! Es gab keine Stimmen.");
                done();
            });
            tick(durationInMs);
        });

        it('does not vote twice for same user', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("userA", "firstSession", "A");
            VotingService.vote("userA", "firstSession", "A");
            VotingService.vote("userA", "firstSession", "A");
            VotingService.vote("userB", "firstSession", "B");
            VotingService.vote("userC", "firstSession", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual("Voting firstSession beendet! Option B hat gewonnen! 67% für B, 33% für A.");
                done();
            });
            tick(durationInMs);
        });
    });

    it('reminds to vote when 20 seconds left', (done: DoneCallback) => {
        const durationInMs: number = 60000;
        VotingService.start("FirstSession", durationInMs, ["A", "B"]);

        VotingService.voteReminder.on("VoteReminder", (res) => {
            expect(res).toEqual("Voting Session FirstSession endet in 20 Sekunden!");
            done();
        });
        tick(durationInMs - 19000);
    });

    function startTestSession(durationInMs: number) {
        const sessionName = "firstSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
    }

    function tick(timeInMs: number) {
        jest.advanceTimersByTimeAsync(timeInMs);
    }
});
