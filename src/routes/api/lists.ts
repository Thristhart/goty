import { Middleware, Next, ParameterizedContext } from "koa";
import { getListFromDB, insertListItem, setListItemPlayedInDB } from "../../data/lists";
import { get } from "../../lib/cache";
import { getGameDetailFromGiantbomb } from "../../lib/giantbomb";
import { GBGame } from "../../lib/giantbomb_model";

export interface ListItem {
    gameId: number;
    listId?: string;
    played: boolean;
    gameDetails?: GBGame;
}

export interface ListItemQuery {
    gameExtId: number;
    userId?: string;
    played?: boolean;
}
const getDefaultList = get("default_list")
    .then((items) => JSON.parse(items))
    .then((items: ListItem[]) => {
        const map = new Map<number, GBGame>();
        items.forEach((item) => {
            map.set(item.gameId, item.gameDetails!);
        });
        return map;
    });

export const getList: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const list = await getListFromDB(ctx.state.user.id);
    const defaultHydratedList = await getDefaultList;
    const fetches = list.map(async (item) => {
        item.gameDetails =
            defaultHydratedList.get(item.gameId) || (await getGameDetailFromGiantbomb("3030-" + item.gameId));
    });

    await Promise.all(fetches);
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

export const addListItem: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    let listItem: ListItemQuery = ctx.request.body;
    listItem.userId = ctx.state.user.id;
    const list = await insertListItem(listItem.userId!, listItem.gameExtId);
    if (list != undefined) {
        ctx.body = list;
    } else {
        ctx.status = 500;
        ctx.body = "DB Error.";
        return;
    }
};
