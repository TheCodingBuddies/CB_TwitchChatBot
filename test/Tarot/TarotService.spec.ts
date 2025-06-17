import {TarotService} from "../../src/Tarot/TarotService";

describe("TarotService", () => {

    beforeEach(() => {
        jest.useFakeTimers();
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

    function tick(timeInMs: number) {
        jest.advanceTimersByTime(timeInMs);
    }
})