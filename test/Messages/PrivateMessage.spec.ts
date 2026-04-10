import { PrivateMessage } from "../../src/Messages/PrivateMessage";

describe('PrivateMessage', () => {
    beforeEach(() => {
        process.env.TWITCH_BOT_USERNAME = 'botName';
        process.env.TWITCH_CHANNEL_NAME = 'ourChannel';
    })


    it('constructs private message', () => {
        const privateMessage = new PrivateMessage("this is our message content");
        expect(privateMessage.content).toEqual(":botName PRIVMSG #ourChannel :this is our message content");
    });
});
