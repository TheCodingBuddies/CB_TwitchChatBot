import fs from "fs";
import {initializeTokenData, loadTokenData, scheduleAutoRefresh} from "../../src/Auth/TokenUpdater";
import * as api from "../../src/Auth/TwitchApi";
import {AxiosResponse} from "axios";

describe('TokenUpdater', () => {
    let saveSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
    });
    beforeEach(() => {
        jest.useFakeTimers();
        saveSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
        });
    })
    afterEach(() => {
        jest.useRealTimers();
        saveSpy.mockRestore();
    })

    it('loads the token data', () => {
        const mockTokenData = {
            access_token: "mock_access_token",
            refresh_token: "mock_refresh_token",
            expires_at: getExpireTimeIn(1),
        };
        const loadSpy = jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(mockTokenData));
        const data = loadTokenData();
        expect(data).toEqual(mockTokenData);
        loadSpy.mockRestore();
    });

    it('creates a new token if no token data exists', async () => {
        Date.now = () => 1000
        const expires_in_sec = 3600;
        const expires_at = Date.now() + expires_in_sec * 1000;
        const tokenCreationResponse: AxiosResponse = {
            data: {
                access_token: "new_access_token",
                refresh_token: "new_refresh_token",
                expires_in: expires_in_sec,
                scope: ["chat:read", "chat:edit"],
                token_type: "bearer",
            },
            status: 200,
            statusText: "OK",
            headers: {"content-type": "application/json"},
            config: undefined,
        };
        const expectedNewTokenData = {
            access_token: "new_access_token",
            refresh_token: "new_refresh_token",
            expires_at: expires_at,
        };
        const loadSpy = jest.spyOn(fs, "readFileSync")
            .mockReturnValue("Missing token data");
        const newTokenSpy = jest.spyOn(api, "createNewTokenData")
            .mockReturnValue(Promise.resolve(tokenCreationResponse))

        const tokenData = await initializeTokenData();

        expect(tokenData).toEqual(expectedNewTokenData);
        expect(saveSpy).toHaveBeenCalledWith("./token-data.json", JSON.stringify(expectedNewTokenData, null, 2));
        loadSpy.mockRestore();
        newTokenSpy.mockRestore();
    });

    it('loads and return valid token data if exists', async () => {
        const existingTokenData = {
            access_token: "existing_access_token",
            refresh_token: "existing_refresh_token",
            expires_at: getExpireTimeIn(2),
        };
        const loadSpy = jest.spyOn(fs, "readFileSync")
            .mockReturnValue(JSON.stringify(existingTokenData));

        const tokenData = await initializeTokenData();

        expect(tokenData).toEqual(existingTokenData);
        loadSpy.mockRestore();
    });

    it('loads expired token and refreshes token data', async () => {
        Date.now = () => 1000;
        const expires_in_sec = 3600;
        const expires_at = Date.now() + expires_in_sec * 1000;
        const expiredTokenData = {
            access_token: "expired_access_token",
            refresh_token: "expired_refresh_token",
            expires_at: 999,
        };
        const authResponse: AxiosResponse = {
            data: {},
            status: 200,
            statusText: "OK",
            headers: {"content-type": "application/json"},
            config: undefined,
        }
        const refreshResponse: AxiosResponse = {
            data: {
                access_token: "refreshed_access_token",
                refresh_token: "refreshed_refresh_token",
                expires_in: expires_in_sec,
                scope: ["chat:read", "chat:edit"],
                token_type: "bearer",
            },
            status: 200,
            statusText: "OK",
            headers: {"content-type": "application/json"},
            config: undefined,
        };
        const refreshedTokenData = {
            access_token: "refreshed_access_token",
            refresh_token: "refreshed_refresh_token",
            expires_at: expires_at,
        };
        const loadSpy = jest.spyOn(fs, "readFileSync")
            .mockReturnValue(JSON.stringify(expiredTokenData));
        const authInfoSpy = jest.spyOn(api, "getUserAuthInformation")
            .mockImplementationOnce(() => Promise.reject({response: {status: 401}}))
            .mockImplementationOnce(() => Promise.resolve(authResponse));
        const refreshSpy = jest.spyOn(api, "refreshToken")
            .mockReturnValue(Promise.resolve(refreshResponse));

        const tokenData = await initializeTokenData();

        expect(tokenData).toEqual(refreshedTokenData);
        expect(saveSpy).toHaveBeenCalledWith("./token-data.json", JSON.stringify(refreshedTokenData, null, 2));
        loadSpy.mockRestore();
        authInfoSpy.mockRestore();
        refreshSpy.mockRestore();
    });

    it('refreshes token after timeout', () => {
        Date.now = () => 5_000;
        const tokenData = {
            access_token: "new_access_token",
            refresh_token: "new_refresh_token",
            expires_at: 900_000,
        };
        const refreshResponse: AxiosResponse = {
            data: {
                access_token: "refreshed_access_token",
                refresh_token: "refreshed_refresh_token",
                expires_in: 3600,
                scope: ["chat:read", "chat:edit"],
                token_type: "bearer",
            },
            status: 200,
            statusText: "OK",
            headers: {"content-type": "application/json"},
            config: undefined,
        }
        const expectedTokenData = {
            access_token: "refreshed_access_token",
            refresh_token: "refreshed_refresh_token",
            expires_in: 3600,
        }

        const refreshSpy = jest.spyOn(api, "refreshToken")
            .mockImplementation(() => {
                return Promise.resolve(refreshResponse)
            });

        scheduleAutoRefresh(tokenData);
        tick(595.001);

        expect(saveSpy).toHaveBeenCalledWith("./token-data.json", JSON.stringify(expectedTokenData, null, 2));
        refreshSpy.mockRestore();
    });

    function tick(timeInMs: number) {
        jest.advanceTimersByTime(timeInMs);
    }

    function getExpireTimeIn(hours: number): number {
        const now = new Date();
        const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return Math.floor(futureDate.getTime() / 1000);
    }
});