import Router from "@koa/router";
import { requireAuthenticationOr403, requireAuthenticationOrRedirectToLogin } from "./auth";
import { getGameDetail, getGames } from "./routes/api/games";
import { getList } from "./routes/api/lists";
import { googleAuth } from "./routes/login_with_google/googleAuth";

export const router = new Router();

router.get("/", requireAuthenticationOrRedirectToLogin, (ctx, next) => {
    return next();
});

router.get("/api/games", requireAuthenticationOr403, getGames);
router.get("/api/game", requireAuthenticationOr403, getGameDetail);
router.get("/api/list", requireAuthenticationOr403, getList);

router.use("/login_with_google", googleAuth.routes(), googleAuth.allowedMethods());
