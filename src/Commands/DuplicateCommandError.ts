export class DuplicateCommandError extends Error {
    constructor(duplicatedCommand: string) {
        super(`Duplicate command ${duplicatedCommand} found`);
    }
}
