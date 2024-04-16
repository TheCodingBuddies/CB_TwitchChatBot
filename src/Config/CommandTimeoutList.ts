import {Command, CommandScope} from "./CommandParser";

export class CommandTimeoutList {

    private readonly keySeparator = '#';

    private entries: Map<string, number> = new Map<string, number>();

    constructor() {

    }

    add(command: Command, user: string) {
        const key = this.createKey(command, user);
        if (!this.entries.has(key))
            this.entries.set(key, Date.now() + (command.cooldownInSec * 1000));
    }

    update() {
        for (let key of this.entries.keys()) {
            if (this.entries.get(key) <= Date.now()) {
                this.entries.delete(key);
            }
        }
    }

    hasTimeout(command: Command, user: string): boolean {
        const key = this.createKey(command, user);
        return this.entries.has(key);
    }

    count(): number {
        return this.entries.size;
    }

    untilFor(command: Command, user: string): number {
        const key = this.createKey(command, user);
        return this.entries.get(key);
    }

    private createKey(command: Command, user: string): string {
        const suffix = (!!user && command.scope == CommandScope.USER) ? user : 'global';
        return `${command.name}${this.keySeparator}${suffix}`;
    }
}
