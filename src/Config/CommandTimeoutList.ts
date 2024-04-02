import {Command} from "./CommandParser";

export class CommandTimeoutList {
    private entries: Map<string, number> = new Map<string, number>();

    constructor() {

    }

    add(command: Command) {
        if (!this.entries.has(command.name))
            this.entries.set(command.name, Date.now() + (command.cooldownInSec * 1000));
    }

    update() {
        for (let key of this.entries.keys()) {
            if (this.entries.get(key) <= Date.now()) {
                this.entries.delete(key);
            }
        }
    }

    hasTimeout(name: string): boolean {
        return this.entries.has(name);
    }

    count(): number {
        return this.entries.size;
    }

    untilFor(name: string) : number {
        return this.entries.get(name);
    }
}
