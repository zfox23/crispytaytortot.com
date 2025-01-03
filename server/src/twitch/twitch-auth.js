"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTwitchUserAccessToken = exports.getUserIDFromAccessToken = exports.getTwitchUserAuthInfo = exports.setCachedTwitchUserAuthInfo = exports.cachedTwitchUserAuthInfo = void 0;
const path_1 = __importDefault(require("path"));
const fs = require('fs');
const setCachedTwitchUserAuthInfo = (authInfo) => {
    exports.cachedTwitchUserAuthInfo = authInfo;
};
exports.setCachedTwitchUserAuthInfo = setCachedTwitchUserAuthInfo;
const getTwitchUserAuthInfo = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const TWITCH_CLIENT_CREDENTIALS_GRANT_URL = 'https://id.twitch.tv/oauth2/token';
    let twitchUserAuthInfo;
    const requestBody = {
        "client_id": process.env.TWITCH_CLIENT_ID,
        "client_secret": process.env.TWITCH_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": process.env.TWITCH_REDIRECT_URI
    };
    const body = Object.keys(requestBody)
        .map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]); })
        .join('&');
    try {
        twitchUserAuthInfo = yield fetch(TWITCH_CLIENT_CREDENTIALS_GRANT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            credentials: 'include',
            body
        });
    }
    catch (e) {
        console.error(`${Date.now()}: Error when fetching Twitch User Auth Information:\n${JSON.stringify(e)}`);
        return;
    }
    let twitchUserAuthInfoJSON;
    try {
        twitchUserAuthInfoJSON = yield twitchUserAuthInfo.json();
    }
    catch (e) {
        console.error(`${Date.now()}: Error when transforming Twitch User Auth Information response to JSON:\n${JSON.stringify(e)}`);
        return;
    }
    if (twitchUserAuthInfoJSON["access_token"]) {
        return twitchUserAuthInfoJSON;
    }
    else {
        return;
    }
});
exports.getTwitchUserAuthInfo = getTwitchUserAuthInfo;
const refreshTwitchUserAuthInfo = (refresh_token) => __awaiter(void 0, void 0, void 0, function* () {
    const TWITCH_CLIENT_CREDENTIALS_GRANT_URL = 'https://id.twitch.tv/oauth2/token';
    const requestBody = {
        "client_id": process.env.TWITCH_CLIENT_ID,
        "client_secret": process.env.TWITCH_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": encodeURI(refresh_token)
    };
    const body = Object.keys(requestBody)
        .map((key) => { return encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key]); })
        .join('&');
    let twitchUserAuthInfo;
    try {
        twitchUserAuthInfo = yield fetch(TWITCH_CLIENT_CREDENTIALS_GRANT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            credentials: 'include',
            body
        });
    }
    catch (e) {
        console.error(`${Date.now()}: Error when fetching Twitch User Auth Information from Refresh Token:\n${JSON.stringify(e)}`);
        return;
    }
    let twitchUserAuthInfoJSON;
    try {
        twitchUserAuthInfoJSON = yield twitchUserAuthInfo.json();
    }
    catch (e) {
        console.error(`${Date.now()}: Error when transforming Twitch User Auth Information from Refresh Token response to JSON:\n${JSON.stringify(e)}`);
        return;
    }
    if (twitchUserAuthInfoJSON["access_token"]) {
        return twitchUserAuthInfoJSON;
    }
    else {
        return;
    }
});
const getTwitchUserAccessTokenFromDisk = () => __awaiter(void 0, void 0, void 0, function* () {
    const userAccessTokenJSONPath = path_1.default.join(__dirname, "userAccessToken.json");
    const userAccessTokenJSON = JSON.parse(yield fs.readFileSync(userAccessTokenJSONPath));
    return userAccessTokenJSON;
});
const getUserIDFromAccessToken = (access_token) => __awaiter(void 0, void 0, void 0, function* () {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID);
    let twitchUsersInfo, error;
    try {
        twitchUsersInfo = yield fetch(`https://api.twitch.tv/helix/users`, {
            method: 'GET',
            headers: myHeaders
        });
    }
    catch (e) {
        error = `${Date.now()}: Error when fetching twitchUsersInfo:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    if (twitchUsersInfo.status !== 200) {
        error = `${Date.now()}: When getting Twitch Users info, the Twitch API returned:\n${JSON.stringify(yield twitchUsersInfo.json())}`;
        console.error(error);
        return { ok: false, error };
    }
    let twitchUsersInfoJSON;
    try {
        twitchUsersInfoJSON = yield twitchUsersInfo.json();
    }
    catch (e) {
        error = `${Date.now()}: Error when transforming twitchUsersInfo response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    return { ok: true, id: twitchUsersInfoJSON.data[0].id, login: twitchUsersInfoJSON.data[0].login };
});
exports.getUserIDFromAccessToken = getUserIDFromAccessToken;
const maybeRefreshTwitchUserAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${exports.cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID);
    let twitchUsers, error;
    try {
        twitchUsers = yield fetch(`https://api.twitch.tv/helix/users`, {
            method: 'GET',
            headers: myHeaders
        });
    }
    catch (e) {
        error = `${Date.now()}: Error when fetching twitchFollowerInfo:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    if (!exports.cachedTwitchUserAuthInfo.refresh_token) {
        error = `${Date.now()}: When getting Twitch user info, there was no refresh token!`;
        console.error(error);
        return { ok: false, error };
    }
    if (twitchUsers.status !== 200) {
        exports.cachedTwitchUserAuthInfo = yield refreshTwitchUserAuthInfo(exports.cachedTwitchUserAuthInfo.refresh_token);
        if (!exports.cachedTwitchUserAuthInfo) {
            error = `${Date.now()}: When getting Twitch user info, the Twitch API returned:\n${JSON.stringify(yield twitchUsers.json())}`;
            console.error(error);
            return { ok: false, error };
        }
    }
    return { ok: true };
});
const refreshTwitchUserAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!exports.cachedTwitchUserAuthInfo) {
        exports.cachedTwitchUserAuthInfo = yield getTwitchUserAccessTokenFromDisk();
    }
    if (!exports.cachedTwitchUserAuthInfo) {
        return false;
    }
    const refreshStatus = yield maybeRefreshTwitchUserAccessToken();
    if (!refreshStatus.ok) {
        console.error(refreshStatus.error);
        return false;
    }
    return true;
});
exports.refreshTwitchUserAccessToken = refreshTwitchUserAccessToken;
