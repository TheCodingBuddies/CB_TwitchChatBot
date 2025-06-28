import fs from "fs";
import {AxiosResponse} from "axios";
import {TwitchApi} from "./TwitchApi";

const TOKENS_PATH = "./token-data.json";

export interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export class TokenUpdater {
    constructor() {
    }

    static loadTokenData(): TokenData {
        return JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));
    }

    private static saveTokens(tokenData: TokenData) {
        fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokenData, null, 2));
    }

    private static async refreshAccessToken(oldRefreshToken: string): Promise<TokenData> {
        const response = await TwitchApi.refreshToken(oldRefreshToken);
        const newTokenData = this.prepareTokenDataFrom(response);
        this.saveTokens(newTokenData);
        console.log("Token was refreshed successfully.");
        return newTokenData;
    }

    private static isAccessTokenExpired(tokenData: TokenData): boolean {
        return Date.now() >= tokenData.expires_at;
    }

    private static prepareTokenDataFrom(response: AxiosResponse): TokenData {
        const {access_token, refresh_token, expires_in} = response.data;
        const expires_at = Date.now() + (expires_in * 1000);
        return {access_token, refresh_token, expires_at};
    }

    private static async refreshTokenData(tokenData: TokenData): Promise<TokenData> {
        try {
            await TwitchApi.getUserAuthInformation(tokenData.access_token);
            return tokenData;
        } catch (err: any) {
            if (err.response?.status === 401) {
                console.log("Access denied - try token refresh...");
                tokenData = await this.refreshAccessToken(tokenData.refresh_token);
                const response = await TwitchApi.getUserAuthInformation(tokenData.access_token);
                if (response.status === 200) {
                    return tokenData;
                }
            }
            throw err;
        }
    }

    static scheduleAutoRefresh(tokenData: TokenData) {
        const now = Date.now();
        const refreshInMs = (tokenData.expires_at - now - 60_000); // 1 min before

        if (refreshInMs > 0) {
            console.log(`Next Token-Refresh in ${Math.floor(refreshInMs / 1000)} seconds.`);
            setTimeout(async () => {
                const refreshed = await this.refreshAccessToken(tokenData.refresh_token);
                this.scheduleAutoRefresh(refreshed);
            }, refreshInMs);
        } else {
            console.log("Token expired unexpected – refreshing now...");
            this.refreshAccessToken(tokenData.refresh_token).then(this.scheduleAutoRefresh);
        }
    }

    static async initializeTokenData(): Promise<TokenData> {
        let tokenData: TokenData;

        try {
            tokenData = this.loadTokenData();
            if (this.isAccessTokenExpired(tokenData)) {
                console.log("Token expired unexpected – refreshing now...");
                return await this.refreshTokenData(tokenData);
            }
        } catch (e) {
            console.log("No tokens exists. Create new ones...");
            const response = await TwitchApi.createNewTokenData();
            tokenData = this.prepareTokenDataFrom(response);
            this.saveTokens(tokenData);
        }
        return tokenData;
    }
}