import axios, { AxiosRequestConfig } from "axios";

export async function getUserAuthInformation(accessToken: string, config?: AxiosRequestConfig) {
    return axios.get("https://api.twitch.tv/helix/users", {
        ...config,
        headers: {
            ...(config?.headers || {}),
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": process.env.CLIENT_ID
        }
    });
}

export async function createNewTokenData() {
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

export async function refreshToken(oldRefreshToken: string) {
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
