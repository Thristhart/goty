import { Middleware, Next, ParameterizedContext } from "koa";
import { insertGameToDB } from "../../data/games";
import { generateContToken, getGameDetailFromGiantbomb, getGamesFromGiantbomb } from "../../lib/giantbomb";
import { GBGame } from "../../lib/giantbomb_model";

interface GamesApiResponse {
    contToken?: string;
    games: GBGame[];
}

export const getGames: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    let offset = ctx.query.offset == undefined ? 0 : ctx.query.offset;
    let result = await getGamesFromGiantbomb({ offset });
    ctx.body = result;
    const response: GamesApiResponse = {
        games: result.results,
    };
    if (!isEndOfList(result.number_of_page_results, result.number_of_total_results, result.offset)) {
        response.contToken = generateContToken(result.offset);
    }
    ctx.body = response;
};

const isEndOfList = (page_res: number, total_res: number, offset: number) => {
    return offset + page_res >= total_res;
};

export const getGameDetail: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const guid = ctx.query.guid;
    if (!guid) {
        ctx.status = 400;
        ctx.body = "Missing guid for game details";
        return;
    }

    const response: GBGame = await getGameDetailFromGiantbomb(guid);

    ctx.body = response;
};

export const insertGame: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const guid = ctx.params.id;
    if (!guid) {
        ctx.status = 400;
        ctx.body = "Missing guid.";
        return;
    }

    await insertGameToDB(guid);

    ctx.body = "Pass.";
};
