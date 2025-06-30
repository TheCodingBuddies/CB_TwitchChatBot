import fs from "fs";

export interface PeriodicConfig {
    frequencyInSec: number,
    messages: string[],
}

export class PeriodicStorage {
    static readonly PERIODIC_CONFIG_LOCATION = 'assets/configs/periodic.json';

    private static frequencyInSec: number;
    private static periodicMessages: string[] = [];

    static loadConfig() {
        try {
        const config: PeriodicConfig = JSON.parse(fs.readFileSync(this.PERIODIC_CONFIG_LOCATION, 'utf8'));
        this.frequencyInSec = config.frequencyInSec;
        this.periodicMessages = config.messages;
        } catch (error) {
            this.frequencyInSec = 0;
            this.periodicMessages = [];
        }
    }

    static getFrequencyInSec(): number {
        return this.frequencyInSec;
    }

    static getMessages(): string[] {
        return this.periodicMessages;
    }
}