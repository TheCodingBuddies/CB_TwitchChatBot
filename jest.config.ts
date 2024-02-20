import {Config} from "@jest/types"

const config: Config.InitialOptions = {
    maxConcurrency: 5,
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: ['**/*.spec.ts']
}

export default config;
