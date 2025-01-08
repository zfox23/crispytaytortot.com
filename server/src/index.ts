import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import twitchRouter from './twitch/twitch-routes';
import steamRouter from './steam/steam-routes';
import twitchAuthRouter from './twitch/twitch-auth-routes';
import { cacheAllOwnedApps } from './steam/steam';
import { configDotenv } from 'dotenv';
import scheduleRouter from './schedule/schedule-routes';
import { initDatabase, openDatabase } from './database/db';

configDotenv();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser("some super secret thing, please do not copy this"));

cacheAllOwnedApps();
async function setupDB() {
    await openDatabase();
    await initDatabase();
}

setupDB();

app.use('/api/v1/twitch/', twitchRouter);
app.use('/api/v1/twitch/', twitchAuthRouter);
app.use('/api/v1/steam/', steamRouter);
app.use('/api/v1/schedule/', scheduleRouter);

app.listen(4243, () => console.log(`${Date.now()}: crispytaytortot.com NodeJS server listening on port 4243!`));
