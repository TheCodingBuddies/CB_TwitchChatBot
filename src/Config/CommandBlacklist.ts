export class CommandBlacklist {
    entries: Map<string, number> = new Map<string, number>();

    constructor() {

    }

    add(commandName: string, cooldownInSec: number) {
        if (!this.entries.has(commandName))
            this.entries.set(commandName, Date.now() + (cooldownInSec * 1000));
    }

    remove(commandName: string) {
        this.entries.delete(commandName);
    }

    update() {
        for (let key of this.entries.keys()) {
            if (this.entries.get(key) <= Date.now()) {
                this.remove(key);
            }
        }
    }

    hasTimeout(commandName: string) : boolean {
        return this.entries.has(commandName);
    }
}
