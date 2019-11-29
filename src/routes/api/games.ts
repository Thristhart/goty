
import { ParameterizedContext, Next, Middleware } from 'koa';
import { getGamesFromGiantbomb } from '../../lib/giantbomb';


export const getGames: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    ctx.body = await getGamesFromGiantbomb({});
}
