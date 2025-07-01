import fs from "fs";

export interface PeriodicConfig {
    frequencyInSec: number,
    type: string,
    messages: string[],
}

export class PeriodicStorage {
    static readonly PERIODIC_CONFIG_LOCATION = 'assets/configs/periodic.json';
    static validTypes: string[] = ["seq", "rand"];

    private static frequencyInSec: number;
    private static type: string;
    private static periodicMessages: string[] = [];

    static loadConfig() {
        try {
            const config: PeriodicConfig = JSON.parse(fs.readFileSync(this.PERIODIC_CONFIG_LOCATION, 'utf8'));
            this.frequencyInSec = config.frequencyInSec;
            this.type = this.validType(config.type);
            this.periodicMessages = config.messages;
        } catch (error) {
            this.frequencyInSec = 0;
            this.type = "seq"
            this.periodicMessages = [];
        }
    }

    static validType(type: string): string {
        return this.validTypes.includes(type) ? type : "seq";
    }

    static getFrequencyInSec(): number {
        return this.frequencyInSec;
    }

    static getMessages(): string[] {
        return this.periodicMessages;
    }

    static getType(): string {
        return this.type;
    }
}