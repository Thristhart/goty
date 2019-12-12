import config from "config";
import sql from "mssql";
import { createList } from './lists';
import { logTransactionError } from './sqlHelper';

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
    const transaction = new sql.Transaction(connection);
    ps.input("id", sql.VarChar);
    try {
        transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED, logTransactionError); //I'm not sure what ISOLATION_LEVEL here does, this is default.
        await ps.prepare(`INSERT INTO Users(id) VALUES (@id)`);
        await ps.execute({ id });
        await ps.unprepare();
        createList(id);
        transaction.commit(logTransactionError);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const findOrCreateUser = async (id: string): Promise<User> => {
    const existing = await getUserFromDB(id);
    if (existing) {
        return existing;
    }
    createUser(id);
    return { id };
};
