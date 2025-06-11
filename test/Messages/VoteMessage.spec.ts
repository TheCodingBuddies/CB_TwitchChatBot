import { VoteMessage } from "../../src/Messages/VoteMessage";
import { VotingService } from "../../src/Voting/VotingService";

describe('VoteMessage', () => {

    beforeEach(() => {
        process.env.TWITCH_BOT_USERNAME = "nickname";
        process.env.CHANNEL = "thecodingbuddies";
    })



    describe('default session vote', () => {
        it('start default vote session', () => {
            let expectedId = '';
            let expectedOptions: string[] = [];
            VotingService.start = (id: string, duration: number, options: string[]) => {
                expectedId = id;
                expectedOptions = options;
            };
            const voteMessage = new VoteMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start [A,B]");
            expect(expectedId).toEqual('default');
            expect(expectedOptions).toEqual(["A", "B"]);
            expect(voteMessage.answer()).toEqual(":nickname PRIVMSG #thecodingbuddies :Voting started! Options are A,B");
        });


        it('vote on default session', () => {
            let votedOption = "";
            VotingService.vote = (user: string, id: string, choseOption: string) => {
                if (id === "default")
                    votedOption = choseOption;
            };
            const voteMessage = new VoteMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote A");
            expect(voteMessage.answer()).toEqual("");
            expect(votedOption).toEqual("A");
        });

    });


    describe('specific session vote', () => {
        it('start vote for Session with options A,B', () => {
            let votableOptions : string[] = [];
            let choseDuration = 0;
            VotingService.start = (id: string, duration: number, options: string[]) => {
                if (id === "firstSession") {
                    choseDuration = duration;
                    votableOptions = options;
                }
            };
            const voteMessage = new VoteMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start firstSession [A,B]");
            expect(votableOptions).toEqual(["A","B"]);
            expect(choseDuration).toEqual(60000);
            expect(voteMessage.answer()).toEqual(":nickname PRIVMSG #thecodingbuddies :Voting firstSession started! Options are A,B");
        });

        it('votes for option A on Session as given user', () => {
            let votedOption = "";
            VotingService.vote = (user: string, id: string, choseOption: string) => {
                if (id === "firstSession")
                    votedOption = choseOption;
            };
            const voteMessage = new VoteMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote firstSession A");
            expect(voteMessage.answer()).toEqual("");
            expect(votedOption).toEqual("A");
        });
    });


    it('does not start a new vote for Session without options', () => {
        const voteMessage = new VoteMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start firstSession");
        expect(voteMessage.answer()).toEqual("");
    });
});
