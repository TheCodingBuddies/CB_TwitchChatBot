import {PingMessage} from "../../src/Messages/PingMessage";

describe('Message Parser Tests', () => {
    beforeEach(() => {
    })

    describe('parses the PingMessage correctly', () => {
        it('parses the correct user name', () => {
            const message = new PingMessage("PING :tmi.twitch.tv");
            expect(message.aliveText).toEqual(":tmi.twitch.tv");
        });

        it('responses to PONG', async () => {
            const message = new PingMessage("PING :tmi.twitch.tv");
            expect(await message.answer()).toEqual("PONG :tmi.twitch.tv");
        });
    })
});
