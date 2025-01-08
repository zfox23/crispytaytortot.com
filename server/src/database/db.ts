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
        const sql = `
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT NOT NULL PRIMARY KEY,
                dateString TEXT NOT NULL,
                time TEXT,
                game TEXT NOT NULL,
                description TEXT
            );`;
        db.run(sql, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
