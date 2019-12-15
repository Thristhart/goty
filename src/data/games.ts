import config from "config";
import sql from "mssql";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const getGameFromDB = async (extId: number): Promise<string> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("extId", sql.Int);

    await ps.prepare(`SELECT id FROM Games WHERE externalId = @extId`);
    let result = await ps.execute({ extId });
    await ps.unprepare();

    return result.recordset[0] && result.recordset[0].id;
};

export const transformInternalGameIdsToExternalIds = async (gameIds: readonly string[]): Promise<number[]> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    const inputs: { [key: string]: string } = {};
    gameIds.forEach((game, index) => {
        const name = "gameId" + index;
        ps.input("gameId" + index, sql.UniqueIdentifier);
        inputs[name] = game;
    });

    await ps.prepare(
        `SELECT externalId FROM Games WHERE id IN (${Object.keys(inputs)
            .map((i) => "@" + i)
            .join(", ")})`
    );
    let result = await ps.execute(inputs);
    await ps.unprepare();

    return result.recordset.map((record) => record.externalId);
};

export const insertGameToDB = async (extId: number): Promise<boolean> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);
    ps.input("extId", sql.Int);
    try {
        await ps.prepare(`INSERT INTO Games(externalId) VALUES (@extId)`);
        await ps.execute({ extId });
        await ps.unprepare();
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const findOrCreateGame = async (extId: number): Promise<string> => {
    const existing = await getGameFromDB(extId);
    if (existing) {
        return existing;
    }
    await insertGameToDB(extId);
    const newGameId = await getGameFromDB(extId);
    return newGameId;
};
