import {PlaceHolderTransformer} from "../../src/Messages/PlaceHolderTransformer";

describe('PlaceHolderTransformer', () => {
    let placeHolderTransformer: PlaceHolderTransformer;

    beforeEach(() => {
        Math.random = () => 0.1;
    })

    describe('replace rand functions', () => {
        it('replaces the rand placeholder with a random chose option', () => {
            placeHolderTransformer = new PlaceHolderTransformer("I choose ${rand(a,b,c++)}", "user");
            const replaced_response = placeHolderTransformer.transform();
            expect(replaced_response).toEqual("I choose a");
        });

        it('replaces all the rand placeholders with a random chose option', () => {
            placeHolderTransformer = new PlaceHolderTransformer("I choose ${rand(a,b,c#)} with ${rand(x,y,z)}", "user");
            const replaced_response = placeHolderTransformer.transform();
            expect(replaced_response).toEqual("I choose a with x");
        });
    });

    describe('replace sender placeholder', () => {
        it('replaces the sender placeholder', () => {
            placeHolderTransformer = new PlaceHolderTransformer("Hello ${sender}", "user");
            const replaced_response = placeHolderTransformer.transform();
            expect(replaced_response).toEqual("Hello user");
        });
    });

});
