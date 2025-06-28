import DoneCallback = jest.DoneCallback;
import {TokenUpdater} from "../../src/Auth/TokenUpdater";
import {TwitchApi} from "../../src/Auth/TwitchApi";
import {AxiosResponse} from "axios";

function getExpireTimeIn(hours: number): number {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return futureDate.getTime();
}

let loadedTokenData = {
    access_token: "mock_access_token",
    refresh_token: "mock_refresh_token",
    expires_at: getExpireTimeIn(1),
};
let loadFileFailed = false;
let savedTokenData = {};

jest.mock('fs', () => {
    const mockReadFileSync = ((path: string): string => {
        if (loadFileFailed) {
            throw new Error("File not found");
        }
        return JSON.stringify(loadedTokenData);
    });

    const mockWriteFileSync = ((path: string, data: string): void => {
        savedTokenData = {path: path, data: data}
    })

    return {
        readFileSync: mockReadFileSync,
        writeFileSync: mockWriteFileSync,
    }
})

describe('TokenUpdater', () => {
    beforeEach(() => {
        loadFileFailed = false;
        savedTokenData = {};
        jest.useFakeTimers();
    })
    afterEach(() => {
        jest.clearAllTimers();
    })
    afterAll(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    })

    it('loads the token data', () => {
        loadedTokenData = {
            access_token: "mock_access_token",
            refresh_token: "mock_refresh_token",
            expires_at: getExpireTimeIn(1),
        };
        const data = TokenUpdater.loadTokenData();
        expect(data).toEqual(loadedTokenData);
    });

    it('creates a new token if no token data exists', (done: DoneCallback) => {
        loadFileFailed = true;
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
        TwitchApi.createNewTokenData = () => {
            return Promise.resolve(tokenCreationResponse)
        }

        TokenUpdater.initializeTokenData().then(tokenData => {
            expect(tokenData).toEqual(expectedNewTokenData);
            expect(savedTokenData).toEqual({
                path: "./token-data.json",
                data: JSON.stringify(expectedNewTokenData, null, 2)
            });
            done();
        });
    });

    it('loads and return valid token data if exists', (done: DoneCallback) => {
        loadedTokenData = {
            access_token: "existing_access_token",
            refresh_token: "existing_refresh_token",
            expires_at: getExpireTimeIn(2),
        };

        TokenUpdater.initializeTokenData().then(tokenData => {
            expect(tokenData).toEqual(loadedTokenData);
            done();
        });
    });

    it('loads expired token and refreshes token data', (done: DoneCallback) => {
        Date.now = () => 1000;
        const expires_in_sec = 3600;
        const expires_at = Date.now() + expires_in_sec * 1000;
        loadedTokenData = {
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
        TwitchApi.getUserAuthInformation = (accessToken) => {
            if (accessToken === "expired_access_token") {
                return Promise.reject({response: {status: 401}});
            } else {
                return Promise.resolve(authResponse);
            }
        }
        TwitchApi.refreshToken = () => {
            return Promise.resolve(refreshResponse)
        }

        TokenUpdater.initializeTokenData().then(tokenData => {
            expect(tokenData).toEqual(refreshedTokenData);
            expect(savedTokenData).toEqual({
                path: "./token-data.json",
                data: JSON.stringify(refreshedTokenData, null, 2)
            });
            done();
        });
    });

    it('refreshes token after timeout', async () => {
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
            expires_at: 5000 + 3600 * 1000,
        }

        TwitchApi.refreshToken = () => {
            return Promise.resolve(refreshResponse)
        }

        TokenUpdater.scheduleAutoRefresh(tokenData);
        await jest.advanceTimersByTimeAsync(900_000); //kranker jest kram, stellt sicher, dass setTimeout abgeschlossen wird bevor es hier weiter geht

        expect(savedTokenData).toEqual({path: "./token-data.json", data: JSON.stringify(expectedTokenData, null, 2)});
    });
});