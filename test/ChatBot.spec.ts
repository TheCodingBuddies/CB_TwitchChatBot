import {ChatBot} from "../src/ChatBot";
import {ConfigStorage} from "../src/Config/ConfigStorage";

let configsLoaded = false;
const mockLoadConfigs = () => {
    configsLoaded = true;
};

describe('ChatBot', () => {

    beforeEach(() => {
        ConfigStorage.loadConfigs = mockLoadConfigs;
        configsLoaded = false;
    })

    describe('load configs', () => {
        it('loads the config commands', () => {
            new ChatBot();
            expect(configsLoaded).toBeTruthy();
        });
    });
});
