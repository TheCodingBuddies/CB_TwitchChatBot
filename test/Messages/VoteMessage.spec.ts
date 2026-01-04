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
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start 60 [A,B]")
            const voteMessage = new VoteMessage(rawMessage);
            expect(expectedId).toEqual('Aktives Voting läuft');
            expect(expectedOptions).toEqual(["A", "B"]);
            expect(await voteMessage.answer()).toEqual(":nickname PRIVMSG #thecodingbuddies :Voting started! Optionen sind A,B");
        });


        it('vote on default session', async () => {
            let votedOption = "";
            VotingService.vote = (user: string, choseOption: string) => {
                votedOption = choseOption;
            };
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote A")
            const voteMessage = new VoteMessage(rawMessage);
            expect(await voteMessage.answer()).toEqual("");
            expect(votedOption).toEqual("A");
        });

    });

    describe('specific session vote', () => {
        it.each(['firstSession', '"Was geht ab?"'])
        ('start vote for Session %s with options A,B', async (sessionName: string) => {
            let votableOptions: string[] = ["A", "B"];
            let choseDuration = 60_000;
            let clearSessionName = sessionName.replace(/"/g, "");
            VotingService.start = (id: string, duration: number, options: string[]) => {
                if (id === clearSessionName) {
                    choseDuration = duration;
                    votableOptions = options;
                }
            };
            const rawMessage = new RawMessage(`:user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start ${sessionName} 60 [A,B]`)
            const voteMessage = new VoteMessage(rawMessage);
            expect(votableOptions).toEqual(["A", "B"]);
            expect(choseDuration).toEqual(60000);
            expect(await voteMessage.answer()).toEqual(`:nickname PRIVMSG #thecodingbuddies :Voting "${clearSessionName}" started! Optionen sind A,B`);
        });

        it('votes for option A on Session as given user', async () => {
            let votedOption = "";
            VotingService.vote = (user: string, choseOption: string) => {
                votedOption = choseOption;
            };
            const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote firstSession A")
            const voteMessage = new VoteMessage(rawMessage);
            expect(await voteMessage.answer()).toEqual("");
            expect(votedOption).toEqual("A");
        });
    });

    it('cancels a voting', async () => {
        const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-cancel")
        const voteMessage = new VoteMessage(rawMessage);
        expect(await voteMessage.answer()).toEqual("");
    });

    it('does not start a new vote for Session without options', async () => {
        const rawMessage = new RawMessage(":user123!user123@user123.tmi.twitch.tv PRIVMSG #channel :!vote-start firstSession")
        const voteMessage = new VoteMessage(rawMessage);
        expect(await voteMessage.answer()).toEqual("");
    });
});
