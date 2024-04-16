import {CommandTimeoutList} from "../../src/Config/CommandTimeoutList";
import {CommandScope} from "../../src/Config/CommandParser";

describe('Command TimeoutList', () => {
    let timeoutList: CommandTimeoutList;
    const globalCommand = {name: "myCommand", cooldownInSec: 10, response: "", scope: CommandScope.GLOBAL};
    const userCommand = {name: "myCommand", cooldownInSec: 10, response: "", scope: CommandScope.USER};

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
        it('adds global command to timeoutList', () => {
            timeoutList.add(globalCommand, "userA");
            expect(timeoutList.count()).toEqual(1);
            expect(timeoutList.untilFor(globalCommand, "userA")).toEqual(10001);
        });

        it('adds command twice to timeoutList for different user', () => {
            timeoutList.add(userCommand, 'userA');
            timeoutList.add(userCommand, 'userB');
            expect(timeoutList.count()).toEqual(2);
            expect(timeoutList.untilFor(userCommand, "userA")).toEqual(10001);
            expect(timeoutList.untilFor(userCommand, "userB")).toEqual(10001);
        });

        it('does not add a command which already exists', () => {
            timeoutList.add(globalCommand, "userA");
            timeoutList.add({...globalCommand, cooldownInSec: 20}, "userA");
            expect(timeoutList.count()).toEqual(1);
            expect(timeoutList.untilFor(globalCommand, "userA")).toEqual(10001);
        });
    });

    describe('updating timeoutList', () => {
        it('removes command from timeoutList after timeout', () => {
            timeoutList.add(globalCommand, "userA");
            Date.now = () => 20000;
            timeoutList.update();
            expect(timeoutList.count()).toEqual(0);
        });

        it('keeps command on timeoutList during timeout', () => {
            timeoutList.add(globalCommand, "userA");
            Date.now = () => 500;
            timeoutList.update();
            expect(timeoutList.count()).toEqual(1);
        });
    });

    describe('has timeout', () => {
        it('has a timeout when command is listed', () => {
            timeoutList.add(globalCommand, "userA");
            expect(timeoutList.hasTimeout(globalCommand, "userA")).toBeTruthy();
        });

        it('has no a timeout when command is not listed', () => {
            expect(timeoutList.hasTimeout(globalCommand, "userA")).toBeFalsy();
        });
    });
});
