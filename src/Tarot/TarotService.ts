export class TarotService {
    static readonly sessionTimeMs: number = 10 * 60 * 1000; //10 * 60 * 1000;
    private static activeSession: boolean = false;

    static startTimer(): void {
        this.activeSession  = true;
        setTimeout(() => {
            this.activeSession  = false;
        }, this.sessionTimeMs)
    }

    static isSessionActive(): boolean {
        return this.activeSession;
    }
}
