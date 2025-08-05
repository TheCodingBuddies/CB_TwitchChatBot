import axios, { AxiosRequestConfig } from "axios";
import {SubscriptionEvent} from "../SubscriptionEvents/SubscriptionEvent";

export class TwitchApi {

    constructor() {
    }

    static async getUserAuthInformation(accessToken: string, config?: AxiosRequestConfig) {
        return axios.get("https://api.twitch.tv/helix/users", {
            ...config,
            headers: {
                ...(config?.headers || {}),
                Authorization: `Bearer ${accessToken}`,
                "Client-Id": process.env.CLIENT_ID
            }
        });
    }

    static async createNewTokenData() {
        const body = new URLSearchParams();
        body.append("client_id", process.env.CLIENT_ID);
        body.append("client_secret", process.env.CLIENT_SECRET);
        body.append("code", process.env.AUTH_CODE);
        body.append("grant_type", "authorization_code");
        body.append("redirect_uri", process.env.REDIRECT_URI);

        return axios.post("https://id.twitch.tv/oauth2/token", body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    static async refreshToken(oldRefreshToken: string) {
        const body = new URLSearchParams();
        body.append("grant_type", "refresh_token");
        body.append("refresh_token", oldRefreshToken);
        body.append("client_id", process.env.CLIENT_ID);
        body.append("client_secret", process.env.CLIENT_SECRET);

        return axios.post("https://id.twitch.tv/oauth2/token", body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    static async subscribeToChannel(subscriptionEvent: SubscriptionEvent) {
        return axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', subscriptionEvent, {
            headers: {
                "Content-Type": "application/json",
                "Client-Id": process.env.CLIENT_ID,
                "Authorization": `Bearer ${process.env.USER_ACCESS_TOKEN}`
            }
        });
    }


}