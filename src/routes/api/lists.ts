import { Middleware, Next, ParameterizedContext } from "koa";
import { getListFromDB, setListItemPlayedInDB } from "../../data/lists";

export interface ListItem {
    gameId: string;
    listId?: string;
    played: boolean;
}

export interface ListItemQuery {
    gameExtId: string;
    userId?: string;
    played: boolean;
}

export const getList: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const list = await getListFromDB(ctx.state.user.id);
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
    const list = await setListItemPlayedInDB(ctx.state.user.id);
    if (list != undefined) {
        ctx.body = list;
    } else {
        ctx.status = 500;
        ctx.body = "DB Error.";
        return;
    }
};
