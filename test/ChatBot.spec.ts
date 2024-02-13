import {ChatBot} from "../src/ChatBot";
import {Command, CommandParser} from "../src/Config/CommandParser";

const mockParse = ((): Command[] => {
    return [{name: "!test", response: "success"}]
});

describe('ChatBot', () => {
    beforeEach(() => {
        CommandParser.parse = mockParse;
    })

    describe('load configs', () => {
        it('loads commands config', () => {
            const chatBot = new ChatBot();
            expect(chatBot.commands).toEqual([{name: "!test", response: "success"}]);
        });
    });
});
