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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwitchFollowerInfo = exports.getStreams = exports.getChannelSubs = void 0;
const twitch_auth_1 = require("./twitch-auth");
// https://discuss.dev.twitch.tv/t/get-stream-total-live-views/28891
// Total stream views is deprecated.
const getChannelSubs = () => __awaiter(void 0, void 0, void 0, function* () {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${twitch_auth_1.cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID);
    let error;
    let twitchSubsInfo;
    try {
        twitchSubsInfo = yield fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}&first=1`, {
            method: 'GET',
            headers: myHeaders
        });
    }
    catch (e) {
        error = `${Date.now()}: Error when fetching /subscriptions:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    if (twitchSubsInfo.status !== 200) {
        error = `${Date.now()}: getChannelSubs: The Twitch API returned:\n${JSON.stringify(yield twitchSubsInfo.json())}`;
        return { ok: false, error, totalSubs: -1 };
    }
    let twitchSubsInfoJSON;
    try {
        twitchSubsInfoJSON = yield twitchSubsInfo.json();
    }
    catch (e) {
        error = `${Date.now()}: Error when transforming getTotalChannelViews response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    return { ok: true, totalSubs: twitchSubsInfoJSON.total };
});
exports.getChannelSubs = getChannelSubs;
const getStreams = () => __awaiter(void 0, void 0, void 0, function* () {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${twitch_auth_1.cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID);
    let error;
    let streamsInfo;
    try {
        streamsInfo = yield fetch(`https://api.twitch.tv/helix/streams?user_id=${process.env.TWITCH_BROADCASTER_ID}`, {
            method: 'GET',
            headers: myHeaders
        });
    }
    catch (e) {
        error = `${Date.now()}: Error in getStreams():\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    if (streamsInfo.status !== 200) {
        error = `${Date.now()}: getStreams: The Twitch API returned:\n${JSON.stringify(yield streamsInfo.json())}`;
        console.error(error);
        return { ok: false, error, totalSubs: -1 };
    }
    let streamsInfoJSON;
    try {
        streamsInfoJSON = yield streamsInfo.json();
    }
    catch (e) {
        error = `${Date.now()}: Error when transforming getStreams response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    return { ok: true, streamsInfoJSON };
});
exports.getStreams = getStreams;
const getTwitchFollowerInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${twitch_auth_1.cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID);
    let error;
    let twitchFollowerInfo;
    try {
        twitchFollowerInfo = yield fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}&first=1`, {
            method: 'GET',
            headers: myHeaders
        });
    }
    catch (e) {
        error = `${Date.now()}: Error when fetching twitchFollowerInfo:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    if (twitchFollowerInfo.status !== 200) {
        error = `${Date.now()}: When getting Twitch follower info, the Twitch API returned:\n${JSON.stringify(yield twitchFollowerInfo.json())}`;
        console.error(error);
        return { ok: false, error };
    }
    let twitchFollowerInfoJSON;
    try {
        twitchFollowerInfoJSON = yield twitchFollowerInfo.json();
    }
    catch (e) {
        error = `${Date.now()}: Error when transforming twitchFollowerInfo response to JSON:\n${JSON.stringify(e)}`;
        console.error(error);
        return { ok: false, error };
    }
    return { ok: true, total: twitchFollowerInfoJSON.total };
});
exports.getTwitchFollowerInfo = getTwitchFollowerInfo;
