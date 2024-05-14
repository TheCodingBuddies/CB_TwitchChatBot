export class PlaceHolderTransformer {
    private savedParams: Map<string, string> = new Map<string, string>();
    private response: string = "";

    constructor(private author: string) {

    }

    extractParams(command: string, template: string) {
        let commandWords = command.split(" ");
        let templateWords = template.split(" ");
        if (commandWords.length !== templateWords.length)
            throw new Error("Extract params failed");

        const paramRegex = /\$\{param\d+\}/;
        while (commandWords.length > 0) {
            let commandWord = commandWords.shift();
            let templateWord = templateWords.shift();
            if (commandWord.toLowerCase() !== templateWord.toLowerCase()
                && !paramRegex.test(templateWord)) {
                throw new Error("Extract params failed");
            }
            if (paramRegex.test(templateWord)) {
                this.savedParams.set(templateWord, commandWord);
            }
        }
    }

    transform(rawResponse: string): string {
        this.response = rawResponse;
        return this.replaceRand()
            .replaceSender()
            .replaceParams()
            .getReplacedResponse();
    }

    private getReplacedResponse(): string {
        return this.response;
    }

    private replaceSender(): PlaceHolderTransformer {
        const randRegex: RegExp = /\${sender}/g;
        this.response = this.response.replace(randRegex, this.author);
        return this;
    }

    private replaceRand(): PlaceHolderTransformer {
        const randRegex: RegExp = /\${rand\(((\w*[-+#]*,)*\w*[-+#]*)\)}/g;
        this.response = this.response.replace(randRegex, (match, value) => {
            let options: string[] = value.split(",");
            let randomIdx = Math.floor(Math.random() * options.length);
            return options[randomIdx];
        });
        return this;
    }

    private replaceParams(): PlaceHolderTransformer {
        this.savedParams.forEach((value, key) => {
            this.response = this.response.replace(key, value);
        })
        return this;
    }
}
