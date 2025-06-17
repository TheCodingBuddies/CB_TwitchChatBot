import {TarotMessage} from "../../src/Messages/TarotMessage";
import axios from "axios";
import {TarotService} from "../../src/Tarot/TarotService";

jest.mock('axios');

describe('TarotMessage', () => {

    beforeEach(() => {
        process.env.NICKNAME = "bot";
        process.env.CHANNEL = "thecodingbuddies";
        TarotService.isSessionActive = () => false;
    })

    describe('Tarot Message answers', () => {
        it.each(["!tech-tarot","!tt"])('answers that tech tarot is %s', (command: string) => {
            const rawMsg = `:user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :${command}`;
            const msg = new TarotMessage(rawMsg);
            expect(msg.answer()).toEqual(":bot PRIVMSG #thecodingbuddies :Deine Tech-Zukunft erfährst du jetzt user123!");
        });

        it('answers empty response on wrong command', () => {
            const rawMsg = `:user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :!wrong-tarot-command`;
            const msg = new TarotMessage(rawMsg);
            expect(msg.answer()).toEqual("");
        });

        it('answers that tech tarot is busy', () => {
            TarotService.isSessionActive = () => true;
            const rawMsg = ":user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :!tech-tarot";
            const msg = new TarotMessage(rawMsg);
            expect(msg.answer()).toEqual(":bot PRIVMSG #thecodingbuddies :Die Zukunft kann gerade nicht");
        });
    });

    describe('sending REST calls to the Tarot Backend', () => {
        it('starts a new tarot game via REST', () => {
            const rawMsg = ":user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :!tech-tarot";
            const msg = new TarotMessage(rawMsg);
            const requestSpy = jest.spyOn(axios, "post").mockImplementation((url) => {
                return {} as any;
            });
            msg.answer();

            expect(requestSpy).toHaveBeenCalledWith("http://localhost:8080/start");

            requestSpy.mockRestore();
        });
    });
});
