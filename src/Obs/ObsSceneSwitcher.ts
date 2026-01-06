import OBSWebSocket from "obs-websocket-js";

export class ObsSceneSwitcher {
    private static obs  = new OBSWebSocket();

    static async switchScene(sceneName: string) {
        try {
            await this.obs.connect("ws://localhost:4455", process.env.OBS_WEBSOCKET_PWD);
            await this.obs.call("SetCurrentProgramScene", { sceneName });
            await this.obs.disconnect();
        } catch (error) {
            console.log("Obs websocket server not available.")
        }

    }
}