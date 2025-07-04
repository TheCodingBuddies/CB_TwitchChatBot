import {VoteMessage} from "../../src/Messages/VoteMessage";
import {VotingService} from "../../src/Voting/VotingService";
import {RawMessage} from "../../src/Messages/RawMessage";

describe('VoteMessage', () => {

    beforeEach(() => {
        process.env.NICKNAME = "nickname";
        process.env.CHANNEL = "thecodingbuddies";
    })

    describe('default session vote', () => {
        it('start default vote session', async () => {
            let expectedId = '';
            let expectedOptions: string[] = [];
            VotingService.start = (id: string, duration: number, options: string[]) => {
                expectedId = id;
                expectedOptions = options;
            };
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start [A,B]")
            const voteMessage = new VoteMessage(rawMessage);
            expect(expectedId).toEqual('default');
            expect(expectedOptions).toEqual(["A", "B"]);
            expect(await voteMessage.answer()).toEqual(":nickname PRIVMSG #thecodingbuddies :Voting started! Options are A,B");
        });


        it('vote on default session', async () => {
            let votedOption = "";
            VotingService.vote = (user: string, id: string, choseOption: string) => {
                if (id === "default")
                    votedOption = choseOption;
            };
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote A")
            const voteMessage = new VoteMessage(rawMessage);
            expect(await voteMessage.answer()).toEqual("");
            expect(votedOption).toEqual("A");
        });

    });

    describe('specific session vote', () => {
        it('start vote for Session with options A,B', async () => {
            let votableOptions : string[] = [];
            let choseDuration = 0;
            VotingService.start = (id: string, duration: number, options: string[]) => {
                if (id === "firstSession") {
                    choseDuration = duration;
                    votableOptions = options;
                }
            };
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start firstSession [A,B]")
            const voteMessage = new VoteMessage(rawMessage);
            expect(votableOptions).toEqual(["A","B"]);
            expect(choseDuration).toEqual(60000);
            expect(await voteMessage.answer()).toEqual(":nickname PRIVMSG #thecodingbuddies :Voting firstSession started! Options are A,B");
        });

        it('votes for option A on Session as given user', async () => {
            let votedOption = "";
            VotingService.vote = (user: string, id: string, choseOption: string) => {
                if (id === "firstSession")
                    votedOption = choseOption;
            };
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote firstSession A")
            const voteMessage = new VoteMessage(rawMessage);
            expect(await voteMessage.answer()).toEqual("");
            expect(votedOption).toEqual("A");
        });
    });

    it('does not start a new vote for Session without options', async () => {
        const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start firstSession")
        const voteMessage = new VoteMessage(rawMessage);
        expect(await voteMessage.answer()).toEqual("");
    });
});
