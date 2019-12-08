import config from "config";
import sql from "mssql";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const getListFromDB = async (id: string): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("id", sql.UniqueIdentifier);
    try {
        await ps.prepare(`SELECT gameId FROM ListItems LI
            INNER JOIN List L ON L.id = LI.listId
            WHERE userId = (@id)`);
        let result = await ps.execute({ id });
        console.log(result);
        await ps.unprepare();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
