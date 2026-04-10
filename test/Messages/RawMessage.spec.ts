import {JOIN, PING, PRIVMSG, RawMessage} from "../../src/Messages/RawMessage";

describe("RawMessage", () => {
    it('parses full raw data correctly', () => {
        const data = "@badge-info=;badges=subscriber/12;color=#00FF00;display-name=BotOfCB;emotes=;id=555 :cb_bot!cb_bot@cb_bot.tmi.twitch.tv PRIVMSG #cb_channel :Hallo, Chat!\n";
        const message: RawMessage = new RawMessage(data);
        const expectedContent = {
            raw: data,
            tags: {
                "badge-info": "",
                "badges": "subscriber/12",
                "color": "#00FF00",
                "display-name": "BotOfCB",
                "emotes": "",
                "id": "555"
            },
            prefix: {nickname: "cb_bot", username: "cb_bot", hostname: "cb_bot.tmi.twitch.tv"},
            command: PRIVMSG,
            channel: "cb_channel",
            message: "Hallo, Chat!\n"
        }
        expect(message.content).toEqual(expectedContent);
    });

    it('parses raw data without optional tags correctly', () => {
        const data = ":cb_bot!cb_bot@cb_bot.tmi.twitch.tv PRIVMSG #cb_channel :Hallo, Chat!\n";
        const message: RawMessage = new RawMessage(data);
        const expectedContent = {
            raw: data,
            prefix: {nickname: "cb_bot", username: "cb_bot", hostname: "cb_bot.tmi.twitch.tv"},
            command: PRIVMSG,
            channel: "cb_channel",
            message: "Hallo, Chat!\n"
        }
        expect(message.content).toEqual(expectedContent);
    });

    it('parses raw data without optional prefix, message and channel correctly', () => {
        const data = "PING :tmi.twitch.tv";
        const message: RawMessage = new RawMessage(data);
        const expectedContent = {
            raw: data,
            command: PING,
        }
        expect(message.content).toEqual(expectedContent);
    });
});