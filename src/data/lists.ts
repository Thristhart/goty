import config from "config";
import sql from "mssql";
import { ListItem, ListItemQuery } from "../routes/api/lists";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const getListFromDB = async (id: string): Promise<ListItem[]> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    console.log(id);
    ps.input("id", sql.VarChar);
    let listItems: ListItem[] = [];
    try {
        await ps.prepare(`SELECT gameId, played FROM ListItems LI
            INNER JOIN Lists L ON L.id = LI.listId
            WHERE userId = @id`);
        let result = await ps.execute({ id });
        listItems = [];
        console.log("result.recordset");
        console.dir(result.recordset);
        result.recordset.map((x) => {
            listItems.push({ gameId: x.gameId, played: x.played });
        });
        console.log("listItems");
        console.dir(listItems);
        await ps.unprepare();
        return listItems;
    } catch (e) {
        console.error(e);
        return listItems;
    }
};

export const setListItemPlayedInDB = async (listItem: ListItemQuery): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    let { gameExtId, userId, played } = listItem;
    ps.input("gameId", sql.UniqueIdentifier);
    ps.input("userId", sql.VarChar);
    ps.input("played", sql.Bit);
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
        console.log(result);
        await ps.unprepare();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
