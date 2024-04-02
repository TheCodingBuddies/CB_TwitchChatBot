import {CommandTimeoutList} from "../../src/Config/CommandTimeoutList";

describe('Command Blacklist', () => {
    let timeoutList: CommandTimeoutList;
    const command = {name: "myCommand", cooldownInSec: 10, response: ""};

    beforeEach(() => {
        timeoutList = new CommandTimeoutList();
        Date.now = () => 1;
    })

    describe('timeoutList init', () => {
        it('has an empty list on init', () => {
            expect(timeoutList.count()).toEqual(0);
        });
    });

    describe('add commands to timeoutList', () => {
        it('adds command to timeoutList', () => {
            timeoutList.add(command);
            expect(timeoutList.count()).toEqual(1);
            expect(timeoutList.untilFor("myCommand")).toEqual(10001);
        });

        it('does not add a command which already exists', () => {
            timeoutList.add(command);
            timeoutList.add({...command, cooldownInSec: 20});
            expect(timeoutList.count()).toEqual(1);
            expect(timeoutList.untilFor("myCommand")).toEqual(10001);
        });
    });

    describe('updating timeoutList', () => {
        it('removes command from timeoutList after timeout', () => {
            timeoutList.add(command);
            Date.now = () => 20000;
            timeoutList.update();
            expect(timeoutList.count()).toEqual(0);
        });

        it('keeps command on timeoutList during timeout', () => {
            timeoutList.add(command);
            Date.now = () => 500;
            timeoutList.update();
            expect(timeoutList.count()).toEqual(1);
        });
    });

    describe('has timeout', () => {
        it('has a timeout when command is blacklisted', () => {
            timeoutList.add(command);
            expect(timeoutList.hasTimeout("myCommand")).toBeTruthy();
        });

        it('has no a timeout when command is not blacklisted', () => {
            expect(timeoutList.hasTimeout("myCommand")).toBeFalsy();
        });
    });
});
