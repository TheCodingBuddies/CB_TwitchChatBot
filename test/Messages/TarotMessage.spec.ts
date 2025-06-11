import {TarotMessage} from "../../src/Messages/TarotMessage";
import axios from "axios";

jest.mock('axios');

describe('TarotMessage', () => {

    beforeEach(() => {
        process.env.NICKNAME = "bot";
        process.env.CHANNEL = "thecodingbuddies";
    })

    describe('Tarot Message answers', () => {
        it('answers that tech tarot is starting', () => {
            const rawMsg = ":user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :!tarot";
            const msg = new TarotMessage(rawMsg);
            expect(msg.answer()).toEqual(":bot PRIVMSG #thecodingbuddies :Deine Tech-Zukunft erfährst du jetzt user123!");
        });
    });

    describe('sending REST calls to the Tarot Backend', () => {
        it('starts a new tarot game via REST', () => {
            const msg = new TarotMessage("");
            const requestSpy = jest.spyOn(axios, "post").mockImplementation((url) => {
                return {} as any;
            });
            msg.answer();

            expect(requestSpy).toHaveBeenCalledWith("http://localhost:8080/start");

            requestSpy.mockRestore();
        });
    });
});
