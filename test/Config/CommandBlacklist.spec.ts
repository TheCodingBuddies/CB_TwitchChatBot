import {CommandBlacklist} from "../../src/Config/CommandBlacklist";

describe('Command Blacklist', () => {
    let blacklist: CommandBlacklist;

    beforeEach(() => {
        blacklist = new CommandBlacklist();
        Date.now = () => 1;
    })

    describe('blacklist init', () => {
        it('has an empty list on init', () => {
            expect(blacklist.entries.size).toEqual(0);
        });
    });

    describe('add commands to blacklist', () => {
        it('adds command to blacklist', () => {
            blacklist.add("myCommand",10);
            expect(blacklist.entries.size).toEqual(1);
            expect(blacklist.entries.get("myCommand")).toEqual(10001);
        });

        it('does not add a command which already exists', () => {
            blacklist.add("myCommand",10);
            blacklist.add("myCommand",20);
            expect(blacklist.entries.size).toEqual(1);
            expect(blacklist.entries.get("myCommand")).toEqual(10001);
        });
    });

    describe('removes command from blacklist', () => {
        it('removes command successful', () => {
            blacklist.add("myCommand",10);
            blacklist.add("myCommand2", 20);
            blacklist.remove("myCommand");
            expect(blacklist.entries.size).toEqual(1);
        });

        it('does not remove command if not exist', () => {
            blacklist.add("myCommand2",10);
            blacklist.remove("myCommand");
            expect(blacklist.entries.size).toEqual(1);
        });
    })

    describe('updating blacklist', () => {
        it('removes command from blacklist after timeout', () => {
            blacklist.add("myCommand", 10);
            Date.now = () => 20000;
            blacklist.update();
            expect(blacklist.entries.size).toEqual(0);
        });

        it('keeps command on blacklist during timeout', () => {
            blacklist.add("myCommand", 10);
            Date.now = () => 500;
            blacklist.update();
            expect(blacklist.entries.size).toEqual(1);
        });
    });

    describe('has timeout', () => {
        it('has a timeout when command is blacklisted', () => {
            blacklist.add("myCommand", 10);
            expect(blacklist.hasTimeout("myCommand")).toBeTruthy();
        });

        it('has no a timeout when command is not blacklisted', () => {
            expect(blacklist.hasTimeout("myCommand")).toBeFalsy();
        });
    });
});
