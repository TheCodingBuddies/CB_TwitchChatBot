import OBSWebSocket from "obs-websocket-js";

export class ObsSceneSwitcher {
    private static obs  = new OBSWebSocket();

    private static delay(milliseconds: number) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    private static allowedScenes(): string[] {
        return process.env.ALLOWED_TECH_TAROT_SCENES.split(",");
    }

    static async switchScene(sceneName: string) {
        try {
            await this.obs.connect("ws://localhost:4455", process.env.OBS_WEBSOCKET_PWD);
            const result = await this.obs.call("GetCurrentProgramScene");
            if (this.allowedScenes().includes(result.currentProgramSceneName)) {
                await this.obs.call("SetCurrentProgramScene", { sceneName });
                await this.obs.disconnect();
                await this.delay(1500);
            }
        } catch (error) {
            console.log("Obs websocket server not available.")
        }

    }
}