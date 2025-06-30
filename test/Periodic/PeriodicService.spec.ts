import {PeriodicService} from "../../src/Periodic/PeriodicService";
import {PeriodicStorage} from "../../src/Periodic/PeriodicStorage";
import DoneCallback = jest.DoneCallback;

describe('PeriodicService', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        PeriodicService.intervalResult.removeAllListeners();
    });

    it('starts interval and send message if interval is over', (done: DoneCallback) => {
        PeriodicStorage.getMessages = () => ["first periodic message", "second periodic message"];
        PeriodicStorage.getFrequencyInSec = () => 30;
        Math.random = () => 0.6;

        const started = PeriodicService.startInterval();
        tick(30 * 1000 + 1);
        PeriodicService.intervalResult.on("IntervalOver", (res) => {
            expect(res).toEqual("second periodic message");
            done();
        });
        expect(started).toBeTruthy();
    });

    it('sends two messages after two intervals ', (done: DoneCallback) => {
        PeriodicStorage.getMessages = () => ["first periodic message", "second periodic message"];
        PeriodicStorage.getFrequencyInSec = () => 30;
        let messageSent = 0;
        const started = PeriodicService.startInterval();
        tick(60 * 1000 + 1)


        PeriodicService.intervalResult.on("IntervalOver", (res) => {
            messageSent++;
            if (messageSent === 2) {
                expect(true).toBeTruthy();
                done()
            }
        });
        expect(started).toBeTruthy();
    });

    it('do not start the interval without available periodic messages', () => {
        PeriodicStorage.getMessages = () => [];

        expect(PeriodicService.startInterval()).toBeFalsy();
    });

    function tick(timeInMs: number) {
        jest.advanceTimersByTimeAsync(timeInMs);
    }
})