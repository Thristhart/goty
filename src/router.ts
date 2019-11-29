import Router from '@koa/router';
import { getGames } from './routes/api/games';

export const router = new Router();

router.get("/api/games", getGames);