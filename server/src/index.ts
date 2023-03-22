import fetch from 'cross-fetch';
const fs = require('fs');
import express, { Response } from 'express';
import { doubleCsrf } from "csrf-csrf";
import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from "dotenv";
import path from 'path';
dotenv.config();

const app = express();

const {
    generateToken,
    validateRequest,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,
    cookieName: "x-csrf-token",
    cookieOptions: { sameSite: false, secure: false, signed: true }, // not ideal for production, development only
    getTokenFromRequest: (req) => req.query.state?.toString(),
});

app.use(cors());
app.use(express.json());
app.use(cookieParser("some super secret thing, please do not copy this"));

const getTwitchUserAuthInfo = async (code: string) => {
    const TWITCH_CLIENT_CREDENTIALS_GRANT_URL = 'https://id.twitch.tv/oauth2/token';

    let twitchUserAuthInfo;
    const requestBody: any = {
        "client_id": process.env.TWITCH_CLIENT_ID,
        "client_secret": process.env.TWITCH_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": process.env.TWITCH_REDIRECT_URI
    }
    const body = Object.keys(requestBody)
        .map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]); })
        .join('&');

    try {
        twitchUserAuthInfo = await fetch(TWITCH_CLIENT_CREDENTIALS_GRANT_URL,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                credentials: 'include',
                body
            });
    } catch (e) {
        console.error(`${Date.now()}: Error when fetching Twitch User Auth Information:\n${JSON.stringify(e)}`);
        return;
    }

    let twitchUserAuthInfoJSON;
    try {
        twitchUserAuthInfoJSON = await twitchUserAuthInfo.json();
    } catch (e) {
        console.error(`${Date.now()}: Error when transforming Twitch User Auth Information response to JSON:\n${JSON.stringify(e)}`);
        return;
    }

    if (twitchUserAuthInfoJSON["access_token"]) {
        return twitchUserAuthInfoJSON;
    } else {
        return;
    }
}

const refreshTwitchUserAuthInfo = async (refresh_token: string) => {
    const TWITCH_CLIENT_CREDENTIALS_GRANT_URL = 'https://id.twitch.tv/oauth2/token';

    const requestBody: any = {
        "client_id": process.env.TWITCH_CLIENT_ID,
        "client_secret": process.env.TWITCH_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": encodeURI(refresh_token)
    }
    const body = Object.keys(requestBody)
        .map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]); })
        .join('&');

    let twitchUserAuthInfo;
    try {
        twitchUserAuthInfo = await fetch(TWITCH_CLIENT_CREDENTIALS_GRANT_URL,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                credentials: 'include',
                body
            });
    } catch (e) {
        console.error(`${Date.now()}: Error when fetching Twitch User Auth Information from Refresh Token:\n${JSON.stringify(e)}`);
        return;
    }

    let twitchUserAuthInfoJSON;
    try {
        twitchUserAuthInfoJSON = await twitchUserAuthInfo.json();
    } catch (e) {
        console.error(`${Date.now()}: Error when transforming Twitch User Auth Information from Refresh Token response to JSON:\n${JSON.stringify(e)}`);
        return;
    }

    if (twitchUserAuthInfoJSON["access_token"]) {
        return twitchUserAuthInfoJSON;
    } else {
        return;
    }
}

app.get("/api/v1/twitch/connect", async (req, res) => {
    const csrfToken = generateToken(res, req);
    const forceVerify = true;
    return res.redirect(`https://id.twitch.tv/oauth2/authorize?response_type=code&${forceVerify ? "force_verify=true&" : ""}client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&scope=channel%3Aread%3Asubscriptions+moderator%3Aread%3Afollowers&state=${csrfToken}`)
})

interface TwitchUserAuthInfo {
    access_token: string | undefined;
    refresh_token: string | undefined;
    scope: string[];
    token_type: string | undefined;
}
let cachedTwitchUserAuthInfo: TwitchUserAuthInfo;

app.get("/api/v1/twitch/auth", async (req, res) => {
    if (!validateRequest(req)) {
        return res.status(403).send(`Couldn't validate your request.`);
    }

    if (req.query.error) {
        return res.send(req.query.error_description);
    }

    if (!req.query.code) {
        return res.sendStatus(500);
    }

    const twitchUserAuthInfo = await getTwitchUserAuthInfo(req.query.code!.toString());
    const { id, login } = await getUserIDFromAccessToken(twitchUserAuthInfo.access_token);

    if (id === process.env.TWITCH_BROADCASTER_ID) {
        cachedTwitchUserAuthInfo = JSON.parse(JSON.stringify(twitchUserAuthInfo));
        const userAccessTokenJSONPath = path.join(__dirname, "userAccessToken.json");
        fs.writeFileSync(userAccessTokenJSONPath, JSON.stringify(twitchUserAuthInfo));
        return res.send(`Welcome, ${login}. You have successfully authorized crispytaytortot.com, and it will start showing data now.`);
    } else if (id === "686688") {
        const userAccessTokenJSONPath = path.join(__dirname, "userAccessToken.json");
        cachedTwitchUserAuthInfo = JSON.parse(JSON.stringify(twitchUserAuthInfo));
        fs.writeFileSync(userAccessTokenJSONPath, JSON.stringify(twitchUserAuthInfo));
        return res.send(`hi zach 😁`);
    } else {
        return res.status(401).send(`You aren't allowed to authorize this application. Your data has been discarded.`);
    }
})

const getTwitchUserAccessTokenFromDisk = async () => {
    const userAccessTokenJSONPath = path.join(__dirname, "userAccessToken.json");
    const userAccessTokenJSON = JSON.parse(await fs.readFileSync(userAccessTokenJSONPath));
    return userAccessTokenJSON;
}

const getUserIDFromAccessToken = async (access_token: string) => {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID!);

    let twitchUsersInfo, error;
    try {
        twitchUsersInfo = await fetch(`https://api.twitch.tv/helix/users`,
            {
                method: 'GET',
                headers: myHeaders
            });
    } catch (e) {
        error = `${Date.now()}: Error when fetching twitchUsersInfo:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    if (twitchUsersInfo.status !== 200) {
        error = `${Date.now()}: When getting Twitch Users info, the Twitch API returned:\n${JSON.stringify(await twitchUsersInfo.json())}`;
        console.error(error);
        return { ok: false, error };
    }

    let twitchUsersInfoJSON;
    try {
        twitchUsersInfoJSON = await twitchUsersInfo.json();
    } catch (e) {
        error = `${Date.now()}: Error when transforming twitchUsersInfo response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    return { ok: true, id: twitchUsersInfoJSON.data[0].id, login: twitchUsersInfoJSON.data[0].login };
}

// https://discuss.dev.twitch.tv/t/get-stream-total-live-views/28891
// Total stream views is deprecated.
const getChannelSubs = async () => {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID!);
    let error;

    let twitchSubsInfo;
    try {
        twitchSubsInfo = await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}&first=1`,
            {
                method: 'GET',
                headers: myHeaders
            });
    } catch (e) {
        error = `${Date.now()}: Error when fetching /subscriptions:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    if (twitchSubsInfo.status !== 200) {
        error = `${Date.now()}: getChannelSubs: The Twitch API returned:\n${JSON.stringify(await twitchSubsInfo.json())}`;
        return { ok: false, error, totalSubs: -1 };
    }

    let twitchSubsInfoJSON;
    try {
        twitchSubsInfoJSON = await twitchSubsInfo.json();
    } catch (e) {
        error = `${Date.now()}: Error when transforming getTotalChannelViews response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    return { ok: true, totalSubs: twitchSubsInfoJSON.total };
}

const getStreams = async () => {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID!);
    let error;

    let streamsInfo;
    try {
        streamsInfo = await fetch(`https://api.twitch.tv/helix/streams?user_id=${process.env.TWITCH_BROADCASTER_ID}`,
            // streamsInfo = await fetch(`https://api.twitch.tv/helix/streams`,
            {
                method: 'GET',
                headers: myHeaders
            });
    } catch (e) {
        error = `${Date.now()}: Error in getStreams():\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    if (streamsInfo.status !== 200) {
        error = `${Date.now()}: getStreams: The Twitch API returned:\n${JSON.stringify(await streamsInfo.json())}`;
        console.error(error);
        return { ok: false, error, totalSubs: -1 };
    }

    let streamsInfoJSON;
    try {
        streamsInfoJSON = await streamsInfo.json();
    } catch (e) {
        error = `${Date.now()}: Error when transforming getStreams response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    return { ok: true, streamsInfoJSON };
}

const getTwitchFollowerInfo = async () => {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID!);
    let error;

    let twitchFollowerInfo;
    try {
        twitchFollowerInfo = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}&first=1`,
            {
                method: 'GET',
                headers: myHeaders
            });
    } catch (e) {
        error = `${Date.now()}: Error when fetching twitchFollowerInfo:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    if (twitchFollowerInfo.status !== 200) {
        error = `${Date.now()}: When getting Twitch follower info, the Twitch API returned:\n${JSON.stringify(await twitchFollowerInfo.json())}`;
        console.error(error);
        return { ok: false, error };
    }

    let twitchFollowerInfoJSON;
    try {
        twitchFollowerInfoJSON = await twitchFollowerInfo.json();
    } catch (e) {
        error = `${Date.now()}: Error when transforming twitchFollowerInfo response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    return { ok: true, total: twitchFollowerInfoJSON.total };
}

const maybeRefreshTwitchUserAccessToken = async () => {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID!);

    let twitchUsers, error;
    try {
        twitchUsers = await fetch(`https://api.twitch.tv/helix/users`,
            {
                method: 'GET',
                headers: myHeaders
            });
    } catch (e) {
        error = `${Date.now()}: Error when fetching twitchFollowerInfo:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }

    if (!cachedTwitchUserAuthInfo.refresh_token) {
        error = `${Date.now()}: When getting Twitch user info, there was no refresh token!`;
        console.error(error);
        return { ok: false, error };
    }

    if (twitchUsers.status !== 200) {
        cachedTwitchUserAuthInfo = await refreshTwitchUserAuthInfo(cachedTwitchUserAuthInfo.refresh_token!);
        if (!cachedTwitchUserAuthInfo) {
            error = `${Date.now()}: When getting Twitch user info, the Twitch API returned:\n${JSON.stringify(await twitchUsers.json())}`;
            console.error(error);
            return { ok: false, error };
        }
    }

    return { ok: true };
}

const refreshTwitchUserAccessToken = async () => {
    if (!cachedTwitchUserAuthInfo) {
        cachedTwitchUserAuthInfo = await getTwitchUserAccessTokenFromDisk();
    }
    if (!cachedTwitchUserAuthInfo) {
        return false;
    }

    const refreshStatus = await maybeRefreshTwitchUserAccessToken();
    if (!refreshStatus.ok) {
        console.error(refreshStatus.error);
        return false;
    }

    return true;
}

app.get("/api/v1/twitch-info", async (req, res: Response) => {
    await refreshTwitchUserAccessToken();
    if (!cachedTwitchUserAuthInfo) {
        return res.sendStatus(500);
    }

    let twitchFollowerInfo = await getTwitchFollowerInfo();
    if (twitchFollowerInfo.error) {
        return res.status(500).send(twitchFollowerInfo.error);
    }

    // We don't 500 if there's an error here; we display "-1" as the number of subs.
    let channelSubs = await getChannelSubs();

    let streamsInfo = await getStreams();
    let viewerCount = -1;
    let gameName = "";
    if (streamsInfo.ok && streamsInfo.streamsInfoJSON.data.length > 0) {
        viewerCount = streamsInfo.streamsInfoJSON.data[0].viewer_count;
        gameName = streamsInfo.streamsInfoJSON.data[0].game_name
    }

    let retval = {
        "followerCount": twitchFollowerInfo["total"],
        "subCount": channelSubs["totalSubs"],
        "viewerCount": viewerCount,
        "gameName": gameName
    }

    return res.json(retval);
})

app.get("/api/v1/twitch/avg-viewers-30-days", async (req, res: Response) => {
    let result = getLast30Days.all();
    if (result) {
        return res.json(result);
    } else {
        return res.status(500).json({ok: false, message: "Couldn't get viewer data for the last 30 days."});
    }
})

const SQLite = require("better-sqlite3");
const viewersSQL = new SQLite(path.join(__dirname, "..", "db", "viewers.sqlite"));
let getLast30Days: any;
let setViewershipData: any;
const prepareSQLite = () => {
    // Check if the table "viewers" exists.
    const viewersTable = viewersSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'viewers';").get();
    if (!viewersTable['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        viewersSQL.prepare("CREATE TABLE viewers (id INTEGER PRIMARY KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, viewerCount INTEGER, channelIsLive INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        viewersSQL.prepare("CREATE UNIQUE INDEX idx_viewers_id ON viewers (id);").run();
        viewersSQL.pragma("synchronous = 1");
        viewersSQL.pragma("journal_mode = wal");
    }

    getLast30Days = viewersSQL.prepare("SELECT * FROM viewers WHERE timestamp > DATETIME('now', '-30 day')");
    setViewershipData = viewersSQL.prepare("INSERT OR REPLACE INTO viewers (viewerCount, channelIsLive) VALUES (@viewerCount, @channelIsLive);");
}

console.log("Preparing SQLite tables and statements...");
prepareSQLite();
console.log("Prepared!");

const getViewerCountCallback = async () => {
    await refreshTwitchUserAccessToken();

    let streamsInfo = await getStreams();
    let viewerCount = 0;
    let channelIsLive = 0;
    if (streamsInfo.ok && streamsInfo.streamsInfoJSON.data.length > 0) {
        viewerCount = streamsInfo.streamsInfoJSON.data[0].viewer_count;
        channelIsLive = 1;
    } else if (!streamsInfo.ok) {
        console.warn(JSON.stringify(streamsInfo));
    }

    let statement = {
        viewerCount: viewerCount,
        channelIsLive: channelIsLive
    };
    setViewershipData.run(statement);
}
setInterval(async () => {
    getViewerCountCallback();
}, parseInt(process.env.TWITCH_GET_VIEWER_COUNT_INTERVAL_MS || '900000'));
getViewerCountCallback();

app.listen(4243, () => console.log(`${Date.now()}: crispytaytortot.com NodeJS server listening on port 4243!`));
