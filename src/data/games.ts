import config from "config";
import sql from "mssql";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const insertGameToDB = async (id: string): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("id", sql.UniqueIdentifier);
    try {
        await ps.prepare(`INSERT INTO Games(id) VALUES (@id)`);
        await ps.execute({ id });
        await ps.unprepare();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
