import {ChatBot} from "../src/ChatBot";
import {ConfigStorage} from "../src/Config/ConfigStorage";

let configsLoaded = false;
const mockLoadConfigs = () => {
    configsLoaded = true;
};

const mockLoadConfigsFails = () => {
    throw new Error();
};

let exitCode = 0;
const mockExit = (code?: number): never => {
    exitCode = code;
    return undefined as never;
}

describe('ChatBot', () => {

    beforeEach(() => {
        ConfigStorage.loadConfigs = mockLoadConfigs;
        configsLoaded = false;
        exitCode = 0;
    })

    describe('load configs', () => {
        it('loads the config commands', () => {
            new ChatBot();
            expect(configsLoaded).toBeTruthy();
        });

        it('closes the chatbot on incorrect config', () => {
            process.exit = mockExit;
            ConfigStorage.loadConfigs = mockLoadConfigsFails;
            new ChatBot();
            expect(exitCode).toEqual(-1);
        });
    });
});
