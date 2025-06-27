import fs from "fs";
import * as api from "./TwitchApi";
import {AxiosResponse} from "axios";

const TOKENS_PATH = "./token-data.json";

export interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export function loadTokenData(): TokenData {
    return JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));
}

function saveTokens(tokenData: TokenData) {
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokenData, null, 2));
}

async function refreshAccessToken(oldRefreshToken: string): Promise<TokenData> {
    const response = await api.refreshToken(oldRefreshToken);
    const newTokenData = prepareTokenDataFrom(response);
    saveTokens(newTokenData);
    console.log("Token was refreshed successfully.");
    return newTokenData;
}

function isAccessTokenExpired(tokenData: TokenData): boolean {
    return Date.now() >= tokenData.expires_at;
}

function prepareTokenDataFrom(response: AxiosResponse): TokenData {
    const {access_token, refresh_token, expires_in} = response.data;
    const expires_at = Date.now() + (expires_in * 1000);
    return {access_token, refresh_token, expires_at};
}

async function refreshTokenData(tokenData: TokenData): Promise<TokenData> {
    try {
        await api.getUserAuthInformation(tokenData.access_token);
        return tokenData;
    } catch (err: any) {
        if (err.response?.status === 401) {
            console.log("Access denied - try token refresh...");
            tokenData = await refreshAccessToken(tokenData.refresh_token);
            const response = await api.getUserAuthInformation(tokenData.access_token);
            if (response.status === 200) {
                return tokenData;
            }
        }
        throw err;
    }
}

export function scheduleAutoRefresh(tokenData: TokenData) {
    const now = Date.now();
    const refreshInMs = (tokenData.expires_at - now - 60_000); // 1 min before

    if (refreshInMs > 0) {
        console.log(`Next Token-Refresh in ${Math.floor(refreshInMs / 1000)} seconds.`);
        setTimeout(() => {
            refreshAccessToken(tokenData.refresh_token).then(refreshed => {
                scheduleAutoRefresh(refreshed);
            });
            // const refreshed = await refreshAccessToken(tokenData.refresh_token);
            // scheduleAutoRefresh(refreshed);
        }, refreshInMs);
    } else {
        console.log("Token expired unexpected – refreshing now...");
        refreshAccessToken(tokenData.refresh_token).then(scheduleAutoRefresh);
    }
}

export async function initializeTokenData(): Promise<TokenData> {
    let tokenData: TokenData;

    try {
        tokenData = loadTokenData();
        if (isAccessTokenExpired(tokenData)) {
            console.log("Token expired unexpected – refreshing now...");
            return await refreshTokenData(tokenData);
        }
    } catch (e) {
        console.log("No tokens exists. Create new ones...");
        const response = await api.createNewTokenData();
        tokenData = prepareTokenDataFrom(response);
        saveTokens(tokenData);
    }
    return tokenData;
}
