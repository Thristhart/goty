import config from "config";
import sql from "mssql";
import { defaultGameList } from '../constants';
import { ListItem, ListItemQuery } from "../routes/api/lists";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const getListFromDB = async (id: string): Promise<ListItem[]> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("id", sql.VarChar);
    let listItems: ListItem[] = [];
    try {
        await ps.prepare(`SELECT gameId, played FROM ListItems LI
            INNER JOIN Lists L ON L.id = LI.listId
            WHERE userId = @id`);
        let result = await ps.execute({ id });
        listItems = result.recordset.map((x) => ({ gameId: x.gameId, played: x.played }));
        await ps.unprepare();
        return listItems;
    } catch (e) {
        console.error(e);
        return listItems;
    }
};

export const getListId = async (userId: string): Promise<string> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("userId", sql.VarChar);

    await ps.prepare(`SELECT id FROM List
        WHERE userId = @userId`);
    let result = await ps.execute({ userId });
    await ps.unprepare();

    return result.recordset[0];
};

export const setListItemPlayedInDB = async (listItem: ListItemQuery): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    let { gameExtId, userId, played } = listItem;
    ps.input("gameId", sql.UniqueIdentifier);
    ps.input("userId", sql.VarChar);
    ps.input("played", sql.Bit);
    ps.input("gameExtId", sql.Int);
    try {
        await ps.prepare(` 
            UPDATE ListItems
            SET played = @played
            FROM ListItems LI
            INNER JOIN Lists L ON L.id = LI.listId
            INNER JOIN Games G ON G.id = LI.gameId
            WHERE L.userID = @userId
            AND G.externalId = @gameExtId
        `);
        let result = await ps.execute({ gameExtId, userId, played });
        await ps.unprepare();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const initialiseDefaultList = async (userId: string) => {
    const listId = await getListId(userId);
    for (let gameId in defaultGameList) {
        insertListItem(listId, gameId);
    }
}

const insertListItem = async (listId: string, gameId: string) => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("listId", sql.VarChar);
    ps.input("gameId", sql.VarChar);

    try {
        await ps.prepare(`INSERT INTO ListItems(listId, gameId, played) VALUES (@listId, @gameId, 0);`);
        await ps.execute({ listId, gameId });
        await ps.unprepare();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }


}

export const createList = async (userId: string): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("userId", sql.VarChar);
    try {
        await ps.prepare(`INSERT INTO Lists(userID) VALUES (@userId);`);
        await ps.execute({ userId });
        await ps.unprepare();
        initialiseDefaultList(userId);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}