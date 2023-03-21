import fetch from 'cross-fetch';
import express, { Response } from 'express';
import { doubleCsrf } from "csrf-csrf";
import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();

const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateToken, // Use this in your routes to provide a CSRF hash cookie and token.
    validateRequest, // Also a convenience if you plan on making your own middleware.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
    getSecret: () => "this is a test", // NEVER DO THIS
    cookieName: "x-csrf-test", // Prefer "__Host-" prefixed names if possible
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

app.get("/twitch/connect", async (req, res) => {
    const csrfToken = generateToken(res, req);
    return res.redirect(`https://id.twitch.tv/oauth2/authorize?force_verify=true&response_type=code&client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&scope=moderator%3Aread%3Afollowers&state=${csrfToken}`)
})

interface TwitchUserAuthInfo {
    access_token: string;
    refresh_token: string;
    scope: string[];
    token_type: string;
}
let cachedTwitchUserAuthInfo: TwitchUserAuthInfo;

app.get("/twitch/auth", async (req, res) => {
    if (!validateRequest(req)) {
        return res.sendStatus(403);
    }

    if (req.query.error) {
        return res.send(req.query.error_description);
    }

    if (!req.query.code) {
        return res.sendStatus(500);
    }

    const twitchUserAuthInfo = await getTwitchUserAuthInfo(req.query.code!.toString());
    const { id, login } = await getUserIDFromAccessToken(twitchUserAuthInfo.access_token);
    console.log(id)

    if (id === process.env.TWITCH_BROADCASTER_ID) {
        cachedTwitchUserAuthInfo = JSON.parse(JSON.stringify(twitchUserAuthInfo));
        return res.send(`Welcome, ${login}. You have successfully authorized crispytaytortot.com, and it will start showing data now.`);
    } else if (id === "686688") {
        cachedTwitchUserAuthInfo = JSON.parse(JSON.stringify(twitchUserAuthInfo));
        return res.send(`hi zach 😁`);
    } else {
        return res.status(401).send(`You aren't allowed to authorize this application. Your data has been discarded.`);
    }
})

const getTwitchUserAccessTokenFromDisk = () => {
    return {
        "access_token": "fj",
        "refresh_token": "fj",
        "scope": ["fj"],
        "token_type": "fj"
    };
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
        error = `${Date.now()}: When getting Twitch follower info, the Twitch API didn't return a 200!`;
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

    if (twitchUsers.status !== 200) {
        cachedTwitchUserAuthInfo = await refreshTwitchUserAuthInfo(cachedTwitchUserAuthInfo.refresh_token);
        if (!cachedTwitchUserAuthInfo) {
            error = `${Date.now()}: When getting Twitch user info, the Twitch API returned:\n${JSON.stringify(await twitchUsers.json())}`;
            console.error(error);
            return { ok: false, error };
        }
    }

    return { ok: true };
}

app.get("/api/v1/twitch-info", async (req, res: Response) => {
    if (!cachedTwitchUserAuthInfo) {
        cachedTwitchUserAuthInfo = getTwitchUserAccessTokenFromDisk();
    }
    if (!cachedTwitchUserAuthInfo) {
        return res.sendStatus(500);
    }

    const refreshStatus = await maybeRefreshTwitchUserAccessToken();
    if (!refreshStatus.ok) {
        return res.status(500).send(refreshStatus.error);
    }

    let twitchFollowerInfo = await getTwitchFollowerInfo();
    if (twitchFollowerInfo.error) {
        return res.status(500).send(twitchFollowerInfo.error);
    }

    let retval = {
        "followerCount": twitchFollowerInfo["total"]
    }

    return res.json(retval);
})

app.listen(4243, () => console.log(`${Date.now()}: crispytaytortot.com NodeJS server listening on port 4243!`));
