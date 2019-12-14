import config from "config";
import sql from "mssql";
import { logTransactionError } from "./sqlHelper";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

interface User {
    id: string;
}

export const getUserFromDB = async (id: string): Promise<User | undefined> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("id", sql.VarChar);

    await ps.prepare(`SELECT * FROM Users WHERE id = (@id)`);
    let result = await ps.execute({ id });
    await ps.unprepare();

    return result.recordset[0];
};

export const createUser = async (id: string): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    ps.input("id", sql.VarChar(255));
    try {
        await ps.prepare(`EXEC newUser @userId = @id`);
        await ps.execute({ id });
        await ps.unprepare();
        return true;
    } catch (e) {
        logTransactionError(e);
        return false;
    }
};

export const findOrCreateUser = async (id: string): Promise<User> => {
    const existing = await getUserFromDB(id);
    if (existing) {
        return existing;
    }
    await createUser(id);
    return { id };
};
