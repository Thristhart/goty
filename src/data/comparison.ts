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
    ps.input("userId", sql.VarChar(255));

    await ps.prepare(`INSERT INTO Comparison(betterGame, worseGame, userId)
    VALUES (@betterGameId, @worseGameId, @userId)`);
    await ps.execute({ betterGameId, worseGameId, userId: comparison.userId });
    await ps.unprepare();

    return true;
};
export const getComparisonsBetweenTwoGames = async (
    userId: string,
    game1: string,
    game2: string
): Promise<{ betterGame: string; worseGame: string }[]> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    ps.input("game1", sql.UniqueIdentifier);
    ps.input("game2", sql.UniqueIdentifier);
    ps.input("userId", sql.VarChar(255));

    await ps.prepare(
        `SELECT worseGame, betterGame FROM Comparison WHERE betterGame=@game1 AND worseGame=@game2 OR betterGame=@game2 AND worseGame=@game1`
    );
    const result = await ps.execute({ userId, game1, game2 });
    await ps.unprepare();

    return result.recordset;
};

export const getNumberOfTimesGameMeasuredLesserMap = async (userId: string): Promise<{ [gameId: string]: number }> => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    ps.input("userId", sql.VarChar(255));

    await ps.prepare(`SELECT worseGame, Count(worseGame) FROM Comparison WHERE userId=@userId GROUP BY worseGame`);
    const result = await ps.execute({ userId });
    await ps.unprepare();

    const resultMap: { [gameId: string]: number } = {};
    result.recordset.forEach((response) => {
        resultMap[response.worseGame] = response[""];
    });

    return resultMap;
};

export const getGamesThatHaveNeverBeenCompared = async (userId: string) => {
    const connection = await connectionPromise;
    const ps = new sql.PreparedStatement(connection);

    ps.input("userId", sql.VarChar(255));

    // idk what I'm doing but this works
    await ps.prepare(`
    SELECT TOP 1 * FROM 
    (
        SELECT gameId FROM ListItems LI TABLESAMPLE SYSTEM (50 PERCENT)
        INNER JOIN Lists L ON L.id = LI.listId
        INNER JOIN Games G on G.id = LI.gameId
        WHERE userId = @userId AND played = 1
    ) Game1,
    (
        SELECT gameId FROM ListItems LI TABLESAMPLE SYSTEM (50 PERCENT)
        INNER JOIN Lists L ON L.id = LI.listId
        INNER JOIN Games G on G.id = LI.gameId
        WHERE userId = @userId AND played = 1
    ) Game2
    WHERE Game1.gameId != Game2.gameId AND NOT EXISTS (
        Select * FROM Comparison WHERE (
            worseGame = Game1.gameId AND betterGame = Game2.gameId OR
            worseGame = Game2.gameId AND betterGame = Game1.gameId
        )
    ) 
    `);

    const result = await ps.execute({ userId });
    await ps.unprepare();

    return result.recordset[0].gameId;
};
