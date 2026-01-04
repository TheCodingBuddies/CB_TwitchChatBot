import {VotingService} from "../../src/Voting/VotingService";
import DoneCallback = jest.DoneCallback;
import {VotingApi} from "../../src/Voting/VotingApi";
import {AxiosResponse} from "axios";

const mockedAxiosResponse: AxiosResponse<any, any> = {
    data: {success: true},
    status: 200,
    statusText: "OK",
    headers: {},
    config: {
        headers: undefined
    }
};

const mockVoteAnOption = (): Promise<AxiosResponse<any, any>> => {
    return Promise.resolve(mockedAxiosResponse)
}
const mockStartVoteOverlay = (): Promise<AxiosResponse<any, any>> => {
    return Promise.resolve(mockedAxiosResponse);
};
const mockCancelVoteOverlay = (): Promise<AxiosResponse<any, any>> => {
    return Promise.resolve(mockedAxiosResponse);
};

describe("VotingService", () => {

    beforeEach(() => {
        jest.useFakeTimers();
        VotingApi.updateOptions = mockVoteAnOption;
        VotingApi.startVoteOverlay = mockStartVoteOverlay;
        VotingApi.cancelVoteOverlay = mockCancelVoteOverlay;
    });

    afterEach(() => {
        jest.useRealTimers();
        VotingService.recentResult.removeAllListeners();
        VotingService.voteReminder.removeAllListeners();
        VotingService.activeVoteSession = undefined;
    });

    it('started session is active', () => {
        const durationInMs = 60_000;
        VotingService.start("firstSession", durationInMs, ["A", "B"]);
        jest.advanceTimersByTime(durationInMs - 1);

        expect(VotingService.isActive()).toBeTruthy();
    });

    it('cancels a voting', () => {
        const durationInMs = 60_000;
        VotingService.start("firstSession", durationInMs, ["A", "B"]);
        jest.advanceTimersByTime(durationInMs - 1);
        VotingService.cancelVote()

        expect(VotingService.isActive()).toBeFalsy();
    });

    it('removes voting session after time is up', () => {
        const durationInMs = 60000;
        VotingService.start("aSession", durationInMs, ["A", "B"]);
        jest.advanceTimersByTime(durationInMs + 1);
        expect(VotingService.isActive()).toBeFalsy();
    });

    it('started default session and wrote correct summary', (done: DoneCallback) => {
        const durationInMs: number = 60000;
        VotingService.start("Aktives Voting läuft", durationInMs, ["A", "B"]);
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
                expect(res).toEqual('Voting "testSession" beendet! Option A hat gewonnen! Es gab keine Stimmen.');
                done();
            });
            tick(durationInMs);
        });

        it('votes for option A after start Voting and A wins', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "A");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual('Voting "testSession" beendet! Option A hat gewonnen! 100% für A, 0% für B.');
                done();
            });
            tick(durationInMs);
        });

        it('votes for option B after start Voting and B wins', (done: DoneCallback) => {
            const durationInMs = 60000;
            const sessionName = "secondSession";
            VotingService.start(sessionName, durationInMs, ["A", "B"]);
            VotingService.vote("aUser", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual('Voting "secondSession" beendet! Option B hat gewonnen! 100% für B, 0% für A.');
                done();
            });
            tick(durationInMs);
        });

        it('votes for both options, first option voted wins', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("userB", "B");
            VotingService.vote("userA", "A");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual('Voting "testSession" beendet! Option B hat gewonnen! 50% für B, 50% für A.');
                done();
            });
            tick(durationInMs);
        });

        it('votes for option C and A wins because C does not exist', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("aUser", "A");
            VotingService.vote("aUser", "C");
            VotingService.vote("aUser", "C");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual('Voting "testSession" beendet! Option A hat gewonnen! 100% für A, 0% für B.');
                done();
            });
            tick(durationInMs);
        });

        it('does not vote twice for same user', (done: DoneCallback) => {
            const durationInMs = 60000;
            startTestSession(durationInMs);
            VotingService.vote("userA", "A");
            VotingService.vote("userA", "A");
            VotingService.vote("userA", "A");
            VotingService.vote("userB", "B");
            VotingService.vote("userC", "B");
            VotingService.recentResult.on("lastVoteResult", (res) => {
                expect(res).toEqual('Voting "testSession" beendet! Option B hat gewonnen! 67% für B, 33% für A.');
                done();
            });
            tick(durationInMs);
        });
    });

    it('reminds to vote when 20 seconds left', (done: DoneCallback) => {
        const durationInMs: number = 60000;
        VotingService.start("FirstSession", durationInMs, ["A", "B"]);

        VotingService.voteReminder.on("VoteReminder", (res) => {
            expect(res).toEqual('Voting Session "FirstSession" endet in 20 Sekunden!');
            done();
        });
        tick(durationInMs - 19000);
    });

    it('does not remind to vote when voting has only 20 seconds duration', async () => {
        const durationInMs: number = 20_000;
        let reminderSpy = jest.fn();
        VotingService.voteReminder.on("VoteReminder", reminderSpy);

        VotingService.start("Short Voting", durationInMs, ["A", "B"]);
        tick(durationInMs);
        expect(reminderSpy).not.toHaveBeenCalled();
    })

    function startTestSession(durationInMs: number) {
        const sessionName = "testSession";
        VotingService.start(sessionName, durationInMs, ["A", "B"]);
    }

    function tick(timeInMs: number) {
        jest.advanceTimersByTimeAsync(timeInMs);
    }
});
