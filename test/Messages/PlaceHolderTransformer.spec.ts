import {PlaceHolderTransformer} from "../../src/Messages/PlaceHolderTransformer";

describe('PlaceHolderTransformer', () => {
    let placeHolderTransformer: PlaceHolderTransformer;

    beforeEach(() => {
        Math.random = () => 0.1;
    })

    describe('extract', () => {
        it('extract without params successfully', () => {
            placeHolderTransformer = new PlaceHolderTransformer("user");
            expect(() => {
                placeHolderTransformer.extractParams("!static", "!static")
            }).not.toThrow();
        });

        it('throw exception - too many params', () => {
            placeHolderTransformer = new PlaceHolderTransformer("user");
            expect(() => {
                placeHolderTransformer.extractParams("!static hello", "!static")
            }).toThrow(new Error("Extract params failed"));
        });

        it('throw exception - params missing', () => {
            placeHolderTransformer = new PlaceHolderTransformer("user");
            expect(() => {
                placeHolderTransformer.extractParams("!static", "!static ${param1}")
            }).toThrow(new Error("Extract params failed"));
        });

        it('extract params if some exists successfully', () => {
            placeHolderTransformer = new PlaceHolderTransformer("user");
            expect(() => {
                placeHolderTransformer.extractParams("!static hello world", "!static ${param1} ${param2}")
            }).not.toThrow();
        });
    });

    describe('response', () => {
        describe('replace rand functions', () => {
            it('replaces the rand placeholder with a random chose option', () => {
                placeHolderTransformer = new PlaceHolderTransformer("user");
                const replacedResponse = placeHolderTransformer.transform("I choose ${rand(a,b,c++)}");
                expect(replacedResponse).toEqual("I choose a");
            });

            it('replaces all the rand placeholders with a random chose option', () => {
                placeHolderTransformer = new PlaceHolderTransformer("user");
                const replacedResponse = placeHolderTransformer.transform("I choose ${rand(a,b,c#)} with ${rand(x,y,z)}");
                expect(replacedResponse).toEqual("I choose a with x");
            });
        });

        describe('replace sender placeholder', () => {
            it('replaces the sender placeholder', () => {
                placeHolderTransformer = new PlaceHolderTransformer("user");
                const replacedResponse = placeHolderTransformer.transform("Hello ${sender}");
                expect(replacedResponse).toEqual("Hello user");
            });
        });

        describe('replace request param placeholder', () => {
            it('nothing to replace', () => {
                placeHolderTransformer = new PlaceHolderTransformer("userA");
                placeHolderTransformer.extractParams("!nothing", "!nothing");
                const replacedResponse = placeHolderTransformer.transform("nothing to replace");
                expect(replacedResponse).toEqual("nothing to replace");
            });

            it('replace param in response', () => {
                placeHolderTransformer = new PlaceHolderTransformer("userA");
                placeHolderTransformer.extractParams("!hugs userB", "!hugs ${param1}");
                const replacedResponse = placeHolderTransformer.transform("${sender} hugs ${param1}");
                expect(replacedResponse).toEqual("userA hugs userB");
            });
        });
    });
});
