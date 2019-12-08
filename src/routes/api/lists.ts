import { Middleware, Next, ParameterizedContext } from "koa";
import { getListFromDB } from "../../data/lists";
import { GBGame } from "../../lib/giantbomb_model";

export interface GamesApiResponse {
    games: GBGame[];
}

export const getList: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const list = await getListFromDB(ctx.state.user.id);
    if (list != undefined) {
        ctx.body = list;
    } else {
        ctx.status = 500;
        ctx.body = "DB Error.";
        return;
    }
};
