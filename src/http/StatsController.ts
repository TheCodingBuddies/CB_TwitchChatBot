import express from "express";
import {UserStatsService} from "../user/UserStatsService";

export function createStatsHttpServer(userStatsService: UserStatsService) {
    const app = express();

    app.get("/credits", async (_, res) => {
        const credits = await userStatsService.getCredits();
        res.json(credits);
    });

    return app;
}