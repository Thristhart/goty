import config from "config";
import sql from "mssql";
import { Comparison } from "../routes/api/comparison";
import { findOrCreateGame } from "./games";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);
const connectionPromise = pool.connect();

export const insertComparison = async (comparison: Comparison) => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    const betterGameId = await findOrCreateGame(comparison.betterGame);
    const worseGameId = await findOrCreateGame(comparison.worseGame);

    ps.input("betterGameId", sql.UniqueIdentifier);
    ps.input("worseGameId", sql.UniqueIdentifier);
    ps.input("userId", sql.UniqueIdentifier);

    await ps.prepare(`INSERT INTO Comparison(betterGame, worseGame, userId)
    VALUES (@betterGameId, @worseGameId, @userId)`);
    await ps.execute({ betterGameId, worseGameId, userId: comparison.userId });
    await ps.unprepare();

    return true;
};

export const getNumberOfTimesGameMeasuredLesser = async (userId: string, gameId: string) => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    ps.input("worseGameId", sql.UniqueIdentifier);
    ps.input("userId", sql.UniqueIdentifier);

    await ps.prepare(`SELECT COUNT(*) FROM Comparison WHERE worseGame=@worseGameId AND userId=@userId)`);
    const result = await ps.execute({ userId, worseGameId: gameId });
    await ps.unprepare();

    return result.returnValue;
};
