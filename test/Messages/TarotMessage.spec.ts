import {TarotMessage} from "../../src/Messages/TarotMessage";
import axios, {AxiosResponse} from "axios";
import {TarotService} from "../../src/Tarot/TarotService";
import {RawMessage} from "../../src/Messages/RawMessage";

let postCallSuccessful = true;
jest.mock('axios', () => {
    const mockPost = ((url: string, data: any): Promise<AxiosResponse> => {
        if (!postCallSuccessful) {
            console.log('check unsuccessful')
            return Promise.resolve({
                data: {},
                status: 400,
                statusText: "Bad Request",
                headers: {"content-type": "application/json"},
                config: undefined,
            });
        } else {
            return Promise.resolve({
                data: {},
                status: 200,
                statusText: "OK",
                headers: {"content-type": "application/json"},
                config: undefined,
            });
        }
    });

    return {
        post: mockPost,
    }
});

describe('TarotMessage', () => {

    beforeEach(() => {
        process.env.NICKNAME = "bot";
        process.env.CHANNEL = "thecodingbuddies";
        process.env.CHANNEL_POINT_NAME = "Kanalpunkte";
        TarotService.isSessionActive = () => false;
        postCallSuccessful = true;
    })

    describe('Tarot Message answers', () => {
        it.each(["!tech-tarot", "!tt"])('answers on command %s', async (command: string) => {
            const rawData = `:user123!user123@user123.tmi.twitch.tv PRIVMSG #thecodingbuddies :${command}`;
            const rawMessage = new RawMessage(rawData);
            const msg = new TarotMessage(rawMessage);
            expect(await msg.answer()).toEqual(":bot PRIVMSG #thecodingbuddies :Nutze deine Kanalpunkte um deine Tech-Zukunft zu erfahren!");
        });
    });
});
