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
                dateString TEXT NOT NULL,
                time TEXT,
                game TEXT NOT NULL,
                description TEXT
            );`;

        db.run(createTableSql, (err) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }

            // Check if the 'iconUrl' column exists
            const checkColumnSql = `PRAGMA table_info(schedules);`;

            db.all(checkColumnSql, [], (err, columns) => {
                if (err) {
                    console.error(err.message);
                    return reject(err);
                }

                const hasIconUrlColumn = columns.some((column: any) => column.name === 'iconUrl');

                if (!hasIconUrlColumn) {
                    // Add the 'iconUrl' column if it doesn't exist
                    const addColumnSql = `ALTER TABLE schedules ADD COLUMN iconUrl TEXT;`;

                    db.run(addColumnSql, (err) => {
                        if (err) {
                            console.error(err.message);
                            return reject(err);
                        }
                        resolve();
                    });
                } else {
                    // Column already exists
                    resolve();
                }
            });
        });
    });
}