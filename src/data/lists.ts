import config from "config";
import sql from "mssql";
import { defaultGameList } from "../constants";
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

    // Temporarily create game and listitem if not exists in order to enable
    // the pre-prod game filtering workflow
    await ps.prepare(`
        DECLARE @newGameId uniqueidentifier;
        IF NOT EXISTS (SELECT id from Games WHERE externalId = @gameExtId)
        BEGIN
            INSERT INTO Games(externalId) VALUES (@gameExtId)
        END 
        SET @newGameId = (SELECT id from Games WHERE externalId = @gameExtId)
        IF NOT EXISTS (SELECT listId from ListItems WHERE gameId = @newGameId AND listId=(SELECT id from Lists WHERE userID = @userId))
        BEGIN
            INSERT INTO ListItems(gameId, listId) VALUES (@newGameId, (SELECT id from Lists WHERE userID = @userId))
        END
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

const initialiseDefaultList = async (userId: string) => {
    const listId = await getListId(userId);
    for (let gameId of defaultGameList) {
        await insertListItem(listId, gameId);
    }
};

const insertListItem = async (listId: string, gameExtId: number) => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    const gameId = await findOrCreateGame(gameExtId);

    ps.input("listId", sql.UniqueIdentifier);
    ps.input("gameId", sql.UniqueIdentifier);

    await ps.prepare(`INSERT INTO ListItems(listId, gameId, played) VALUES (@listId, @gameId, 0);`);
    await ps.execute({ listId, gameId });
    await ps.unprepare();

    return true;
};

export const createList = async (userId: string): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("userId", sql.VarChar);

    await ps.prepare(`INSERT INTO Lists(userID) VALUES (@userId);`);
    await ps.execute({ userId });
    await ps.unprepare();
    await initialiseDefaultList(userId);

    return true;
};
