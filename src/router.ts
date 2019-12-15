import Router from "@koa/router";
import { requireAuthenticationOr403, requireAuthenticationOrRedirectToLogin } from "./auth";
import { addComparison } from './routes/api/comparison';
import { getGameDetail, getGames, searchGiantbomb } from "./routes/api/games";
import { addListItem, getList, setListItemPlayed } from "./routes/api/lists";
import { googleAuth } from "./routes/login_with_google/googleAuth";
import { microsoftAuth } from "./routes/login_with_microsoft/microsoftAuth";

export const router = new Router();

router.get("/", requireAuthenticationOrRedirectToLogin, (ctx, next) => {
    return next();
});

router.get("/api/games", requireAuthenticationOr403, getGames);
router.get("/api/game", requireAuthenticationOr403, getGameDetail);
router.get("/api/games/search", requireAuthenticationOr403, searchGiantbomb);


router.get("/api/list", requireAuthenticationOr403, getList);
router.put("/api/list/setItem", requireAuthenticationOr403, setListItemPlayed);
router.post("/api/list/addItem", requireAuthenticationOr403, addListItem);

router.post("/api/comparison/choose", requireAuthenticationOr403, addComparison);

router.use("/login_with_google", googleAuth.routes(), googleAuth.allowedMethods());
router.use("/login_with_microsoft", microsoftAuth.routes(), microsoftAuth.allowedMethods());
