import config from "config";
import sql from "mssql";

const sqlInfo: sql.config = config.get("SQL_INFO");
const pool = new sql.ConnectionPool(sqlInfo);

export const insertGameToDB = async (id: string) => {
    const connection = await pool.connect();
    const ps = new sql.PreparedStatement(connection);
    ps.input("id", sql.UniqueIdentifier);
    ps.prepare(`INSERT INTO Games(id) VALUES (@id)`, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        ps.execute({ id }, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            ps.unprepare();
        });
    });
};
