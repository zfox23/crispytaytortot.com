import path from "path";
import { Database } from "sqlite3";

const sqlite3 = require('sqlite3').verbose();
export let db: Database;

export const openDatabase = () => {
    return new Promise<void>((resolve, reject) => {
        const dbPath = path.join(__dirname, "..", "..", "db", "crispyDB.sqlite");
        db = new sqlite3.Database(dbPath, (err: Error) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log('Connected to the SQLite database.');
                resolve();
            }
        });
    });
}

export const initDatabase = () => {
    return new Promise<void>((resolve, reject) => {
        // Create the table if it doesn't exist
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT NOT NULL PRIMARY KEY,
                startDateTimeRFC3339 TEXT NOT NULL,
                endDateTimeRFC3339 TEXT NOT NULL,
                ianaTimeZoneName TEXT NOT NULL,
                game TEXT NOT NULL,
                description TEXT,
                iconUrl TEXT,
                twitchScheduleBroadcastID TEXT
            );`;

        db.run(createTableSql, async (err) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }
        });
    });
}