import path from 'path';
const fs = require('fs');

interface TwitchUserAuthInfo {
    access_token: string | undefined;
    refresh_token: string | undefined;
    scope: string[];
    token_type: string | undefined;
}

export let cachedTwitchUserAuthInfo: TwitchUserAuthInfo;
export const setCachedTwitchUserAuthInfo = (authInfo: TwitchUserAuthInfo) => {
    cachedTwitchUserAuthInfo = authInfo;
}

export const getTwitchUserAuthInfo = async (code: string) => {
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

const getTwitchUserAccessTokenFromDisk = async () => {
    const userAccessTokenJSONPath = path.join(__dirname, "userAccessToken.json");
    const userAccessTokenJSON = JSON.parse(await fs.readFileSync(userAccessTokenJSONPath));
    return userAccessTokenJSON;
}

export const getUserIDFromAccessToken = async (access_token: string) => {
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

export const refreshTwitchUserAccessToken = async () => {
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
