export class PlaceHolderTransformer {
    constructor(private response, private username: string) {

    }

    transform(): string {
        return this.replaceRand()
            .replaceSender()
            .getReplacedResponse();
    }

    private getReplacedResponse(): string {
        return this.response;
    }

    private replaceSender(): PlaceHolderTransformer {
        const randRegex: RegExp = /\${sender}/g;
        this.response = this.response.replace(randRegex, this.username);
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
}
