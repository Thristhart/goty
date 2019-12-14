import { Middleware, Next, ParameterizedContext } from "koa";
import { getListFromDB, setListItemPlayedInDB } from "../../data/lists";
import { getGameDetailFromGiantbomb } from '../../lib/giantbomb';
import { GBGame } from '../../lib/giantbomb_model';

export interface ListItem {
    gameId: string;
    listId?: string;
    played: boolean;
    gameDetails?: GBGame;
}

export interface ListItemQuery {
    gameExtId: number;
    userId?: string;
    played: boolean;
}

export const getList: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const list = await getListFromDB(ctx.state.user.id);
    for (let item of list) {
        item.gameDetails = await getGameDetailFromGiantbomb("3030-" + item.gameId)
    }
    if (list.length != 0) {
        ctx.body = list;
    } else {
        ctx.status = 500;
        ctx.body = "DB Error.";
        return;
    }
};

export const setListItemPlayed: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    let listItem: ListItemQuery = ctx.request.body;
    listItem.userId = ctx.state.user.id;
    const list = await setListItemPlayedInDB(listItem);
    if (list != undefined) {
        ctx.body = list;
    } else {
        ctx.status = 500;
        ctx.body = "DB Error.";
        return;
    }
};
