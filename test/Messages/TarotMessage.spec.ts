import {TarotMessage} from "../../src/Messages/TarotMessage";
import axios from "axios";
import {TarotService} from "../../src/Tarot/TarotService";
import {RawMessage} from "../../src/Messages/RawMessage";

jest.mock('axios');

describe('TarotMessage', () => {

    beforeEach(() => {
        process.env.NICKNAME = "bot";
        process.env.CHANNEL = "thecodingbuddies";
        TarotService.isSessionActive = () => false;
    })

    describe('Tarot Message answers', () => {
        it.each(["!tech-tarot", "!tt"])('answers that tech tarot is %s', (command: string) => {
            const rawData = `:user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :${command}`;
            const rawMessage = new RawMessage(rawData);
            const msg = new TarotMessage(rawMessage);
            expect(msg.answer()).toEqual(":bot PRIVMSG #thecodingbuddies :Deine Tech-Zukunft erfährst du jetzt user123!");
        });

        it('answers that tech tarot is busy', () => {
            TarotService.isSessionActive = () => true;
            const rawData = ":user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :!tech-tarot";
            const rawMessage = new RawMessage(rawData);
            const msg = new TarotMessage(rawMessage);
            expect(msg.answer()).toEqual(":bot PRIVMSG #thecodingbuddies :Die Zukunft kann gerade nicht");
        });
    });

    describe('sending REST calls to the Tarot Backend', () => {
        it('starts a new tarot game via REST', () => {
            const rawData = ":user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :!tech-tarot";
            const rawMessage = new RawMessage(rawData);
            const msg = new TarotMessage(rawMessage);
            const requestSpy = jest.spyOn(axios, "post").mockImplementation((url) => {
                return {} as any;
            });
            msg.answer();

            expect(requestSpy).toHaveBeenCalledWith("http://localhost:8080/start", {"user": "user123"});

            requestSpy.mockRestore();
        });
    });
});
