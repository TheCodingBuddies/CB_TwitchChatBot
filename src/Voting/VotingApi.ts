import axios from "axios";
import {VoteOption} from "./VotingService";

export class VotingApi {
    private static readonly baseUrl = "http://localhost:5173/api/voting"

    constructor() {
    }

    static async startVoteOverlay(votingName: string, durationInSec: number, options: VoteOption[]) {
        return axios.post(`${this.baseUrl}/start`, {name: votingName, durationInSec: durationInSec, options: options});
    }

    static async updateOptions(options: VoteOption[]) {
        return axios.post(`${this.baseUrl}/vote`, {options: options});
    }

    static async cancelVoteOverlay() {
        return axios.post(`${this.baseUrl}/cancel`);
    }
}