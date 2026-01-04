import axios from "axios";
import {VotingApi} from "../../src/Voting/VotingApi";
import {VoteOption} from "../../src/Voting/VotingService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VotingApi', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts the voting overlay', async () => {
        const options: VoteOption[] = [{name: "A", count: 0}, {name: "B", count: 0}];
        await VotingApi.startVoteOverlay("VoteName", 60, options)
        expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:5173/api/voting/start", {
            name: "VoteName",
            durationInSec: 60,
            options: options
        })
    });

    it('adds a vote to overlay voting', async () => {
        const options: VoteOption[] = [{name: "A", count: 100}, {name: "B", count: 200}];
        await VotingApi.updateOptions(options);
        expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:5173/api/voting/vote", {
            options: options
        })
    });

    it('cancels a voting overlay', async () => {
        await VotingApi.cancelVoteOverlay();
        expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:5173/api/voting/cancel")
    });
});