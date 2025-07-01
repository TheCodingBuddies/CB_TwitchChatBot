import {PeriodicConfig, PeriodicStorage} from "../../src/Periodic/PeriodicStorage";

let loadFileFailed = false;
let loadedPeriodicConfig: PeriodicConfig = {
    frequencyInSec: 60,
    type: "rand",
    messages: [
        "message1",
        "second message",
        "this is a third message"
    ]
};

jest.mock('fs', () => {
    const mockReadFileSync = ((path: string): string => {
        if (loadFileFailed) {
            throw new Error("File not found");
        }
        return JSON.stringify(loadedPeriodicConfig);
    });

    return {
        readFileSync: mockReadFileSync,
    }
})

describe('PeriodicStorage', () => {
    beforeEach(() => {
        loadFileFailed = false;
        loadedPeriodicConfig = {
            frequencyInSec: 60,
            type: "rand",
            messages: [
                "message1",
                "second message",
                "this is a third message"
            ]
        };
    })
    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('loads the config if exist', () => {
        const expectedMessages = [
            "message1",
            "second message",
            "this is a third message"
        ]
        PeriodicStorage.loadConfig();

        expect(PeriodicStorage.getFrequencyInSec()).toEqual(60);
        expect(PeriodicStorage.getType()).toEqual("rand");
        expect(PeriodicStorage.getMessages()).toEqual(expectedMessages);
    });

    it('sets type to seq if unknown type is set', () => {
        loadedPeriodicConfig = {
            frequencyInSec: 60,
            type: "reverse",
            messages: [
                "message1",
                "second message",
                "this is a third message"
            ]
        };
        PeriodicStorage.loadConfig();
        expect(PeriodicStorage.getType()).toEqual("seq");
    });

    it('has no messages if config file not exists', () => {
        loadFileFailed = true;
        PeriodicStorage.loadConfig();
        expect(PeriodicStorage.getFrequencyInSec()).toEqual(0);
        expect(PeriodicStorage.getMessages()).toEqual([]);
    });
})