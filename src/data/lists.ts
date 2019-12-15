import config from "config";
import sql from "mssql";
import { ListItem, ListItemQuery } from "../routes/api/lists";
import { findOrCreateGame } from "./games";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const getListFromDB = async (userId: string): Promise<ListItem[]> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("userId", sql.VarChar);
    let listItems: ListItem[] = [];
    await ps.prepare(`SELECT gameId, played, G.externalId FROM ListItems LI
        INNER JOIN Lists L ON L.id = LI.listId
        INNER JOIN Games G ON G.id = LI.gameId
        WHERE userId = @userId`);
    let result = await ps.execute({ userId });
    listItems = result.recordset.map((x) => ({ gameId: x.externalId, played: x.played }));
    await ps.unprepare();
    return listItems;
};

export const getListId = async (userId: string): Promise<string> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("userId", sql.VarChar);

    await ps.prepare(`SELECT id FROM Lists
        WHERE userId = @userId`);
    let result = await ps.execute({ userId });
    await ps.unprepare();

    return result.recordset[0].id;
};

export const setListItemPlayedInDB = async (listItem: ListItemQuery): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    let { gameExtId, userId, played } = listItem;

    ps.input("userId", sql.VarChar);
    ps.input("played", sql.Bit);
    ps.input("gameExtId", sql.Int);

    await ps.prepare(`
        UPDATE ListItems
        SET played = @played
        FROM ListItems LI
        INNER JOIN Lists L ON L.id = LI.listId
        INNER JOIN Games G ON G.id = LI.gameId
        WHERE L.userID = @userId
        AND G.externalId = @gameExtId
    `);
    await ps.execute({ gameExtId, userId, played });
    await ps.unprepare();

    return true;
};

export const insertListItem = async (userId: string, gameExtId: number) => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    const gameId = await findOrCreateGame(gameExtId);

    ps.input("userId", sql.VarChar(255));
    ps.input("gameId", sql.UniqueIdentifier);

    await ps.prepare(`INSERT INTO ListItems(listId, gameId, played)
    SELECT id, @gameId, 1
    FROM Lists WHERE userId = @userId;`);
    await ps.execute({ userId, gameId });
    await ps.unprepare();

    return true;
};
