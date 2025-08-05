import axios from "axios";
import {TwitchApi} from "../../src/Auth/TwitchApi";
import {SubscriptionEvent} from "../../src/SubscriptionEvents/SubscriptionEvent";


jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TwitchApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.CLIENT_ID = "client123id";
        process.env.CLIENT_SECRET = 'clientXXXsecret';
        process.env.AUTH_CODE = 'authCode';
        process.env.REDIRECT_URI = 'http://localhost:5555';
        process.env.USER_ACCESS_TOKEN = 'userAccessToken';
    });

    it('does the right api call to get user auth information', async () => {
        const config = {headers: {"Custom-Header": "CustomHeaderValue"}};
        mockedAxios.get.mockResolvedValueOnce({
            data: {success: true}
        });
        await TwitchApi.getUserAuthInformation("testAccessToken", config);

        expect(mockedAxios.get).toHaveBeenCalledWith("https://api.twitch.tv/helix/users", {
            ...config,
            headers: {
                "Custom-Header": "CustomHeaderValue",
                Authorization: "Bearer testAccessToken",
                "Client-Id": "client123id",
            }
        });
    });

    it('does the right api call to create new token data', async () => {
        const mockedResponse = {
            data: {
                "access_token": "abcdefg1234567",
                "refresh_token": "hijklmn7654321",
                "expires_in": 2592000,
                "scope": [
                    "chat:read",
                    "chat:edit"
                ],
                "token_type": "bearer"
            }
        }

        mockedAxios.post.mockResolvedValueOnce(mockedResponse);
        const response = await TwitchApi.createNewTokenData();

        const body = new URLSearchParams();
        body.append("client_id", "client123id");
        body.append("client_secret", "clientXXXsecret");
        body.append("code", "authCode");
        body.append("grant_type", "authorization_code");
        body.append("redirect_uri", 'http://localhost:5555');
        expect(mockedAxios.post).toHaveBeenCalledWith("https://id.twitch.tv/oauth2/token", body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        expect(response).toEqual(mockedResponse);
    });

    it('does the right call to refresh the token', async () => {
        const mockedResponse = {
            data: {
                "access_token": "abcd1234newaccesstoken",
                "refresh_token": "refreshtoken_5678new",
                "expires_in": 2592000,
                "scope": [
                    "chat:read",
                    "chat:edit"
                ],
                "token_type": "bearer"
            }
        }
        mockedAxios.post.mockResolvedValueOnce(mockedResponse);
        const oldRefreshToken = "oldRefreshToken";
        const response = await TwitchApi.refreshToken(oldRefreshToken);
        const body = new URLSearchParams();
        body.append("grant_type", "refresh_token");
        body.append("refresh_token", oldRefreshToken);
        body.append("client_id", "client123id");
        body.append("client_secret", "clientXXXsecret");
        expect(mockedAxios.post).toHaveBeenCalledWith("https://id.twitch.tv/oauth2/token", body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        expect(response).toEqual(mockedResponse);
    });

    it('subscribes on the right event channel', async () => {
        //todo: NEED TO TEST AND REFACTOR NEW TECH TAROT FEATURE
        const subscriptionEvent: SubscriptionEvent = {
            type: "channel.channel_points_custom_reward_redemption.add",
            version: "1",
            condition: {
                broadcaster_user_id: "channel_id",
            },
            transport: {
                method: "websocket",
                session_id: "the_session_id"
            }
        }
        await TwitchApi.subscribeToChannel(subscriptionEvent)
        expect(mockedAxios.post).toHaveBeenCalledWith("https://api.twitch.tv/helix/eventsub/subscriptions", subscriptionEvent, {headers: {
            "Content-Type": "application/json",
            "Client-Id": "client123id",
            "Authorization": "Bearer userAccessToken"
            }});
    });
})