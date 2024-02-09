import {Config} from "@jest/types"

const config: Config.InitialOptions = {
    maxConcurrency: 5,
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true
}

export default config;
