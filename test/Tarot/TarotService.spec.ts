import {TarotService} from "../../src/Tarot/TarotService";
import {AxiosResponse} from "axios";

let postCallSuccessful = true;
jest.mock('axios', () => {
    const mockPost = ((url: string, data: any): Promise<AxiosResponse> => {
        if (!postCallSuccessful) {
            console.log('check unsuccessful')
            return Promise.resolve({
                data: {},
                status: 400,
                statusText: "Bad Request",
                headers: {"content-type": "application/json"},
                config: undefined,
            });
        } else {
            return Promise.resolve({
                data: {},
                status: 200,
                statusText: "OK",
                headers: {"content-type": "application/json"},
                config: undefined,
            });
        }
    });

    return {
        post: mockPost,
    }
});

describe("TarotService", () => {

    beforeEach(() => {
        jest.useFakeTimers();
        process.env.NICKNAME = "bot";
        process.env.CHANNEL = "thecodingbuddies";
        postCallSuccessful = true;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('has active tarot session on start', () => {
        TarotService.startTimer();
        tick(TarotService.sessionTimeMs - 1);
        expect(TarotService.isSessionActive()).toBeTruthy();
    });

    it('has inactive tarot session after previous session is over', () => {
        TarotService.startTimer();
        tick(TarotService.sessionTimeMs + 1);
        expect(TarotService.isSessionActive()).toBeFalsy();
    });

    describe('Tarot Message answers', () => {
        it('answers on command %s', async () => {
            TarotService.isSessionActive = () => false;
            const answer = await TarotService.initializeTechTarotSessionFor("user123");
            expect(answer).toEqual(":bot PRIVMSG #thecodingbuddies :Deine Tech-Zukunft erfährst du jetzt user123!");
        });

        it('answers that tech tarot is already in a tarot session', async () => {
            TarotService.isSessionActive = () => true;
            const answer = await TarotService.initializeTechTarotSessionFor("user123");
            expect(answer).toEqual(":bot PRIVMSG #thecodingbuddies :Die Zukunft kann gerade nicht");
        });

        it('answers that tech tarot is not available right now', async () => {
            TarotService.isSessionActive = () => false;
            postCallSuccessful = false;
            const answer = await TarotService.initializeTechTarotSessionFor("user123");
            expect(answer).toEqual(":bot PRIVMSG #thecodingbuddies :Die Zukunft hat gerade geschlossen!");
        });
    });

    function tick(timeInMs: number) {
        jest.advanceTimersByTime(timeInMs);
    }
})