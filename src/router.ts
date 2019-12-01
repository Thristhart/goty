import Router from "@koa/router";
import { getGameDetail, getGames, insertGame } from "./routes/api/games";

export const router = new Router();

router.get("/api/games", getGames);
router.get("/api/game", getGameDetail);
router.get("/api/game/:id", insertGame); //TODO: make this a post later.
