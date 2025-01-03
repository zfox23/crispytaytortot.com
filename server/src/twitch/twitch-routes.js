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
const express_1 = __importDefault(require("express"));
const twitch_auth_1 = require("./twitch-auth");
const twitch_1 = require("./twitch");
const twitchRouter = express_1.default.Router();
twitchRouter.get("/info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, twitch_auth_1.refreshTwitchUserAccessToken)();
    if (!twitch_auth_1.cachedTwitchUserAuthInfo) {
        return res.sendStatus(500);
    }
    let twitchFollowerInfo = yield (0, twitch_1.getTwitchFollowerInfo)();
    if (twitchFollowerInfo.error) {
        return res.status(500).send(twitchFollowerInfo.error);
    }
    // We don't 500 if there's an error here; we display "-1" as the number of subs.
    let channelSubs = yield (0, twitch_1.getChannelSubs)();
    let streamsInfo = yield (0, twitch_1.getStreams)();
    let viewerCount = -1;
    let gameName = "";
    let isLive = false;
    if (streamsInfo.ok && streamsInfo.streamsInfoJSON.data.length > 0) {
        viewerCount = streamsInfo.streamsInfoJSON.data[0].viewer_count;
        gameName = streamsInfo.streamsInfoJSON.data[0].game_name;
        isLive = streamsInfo.streamsInfoJSON.data[0].type === "live";
    }
    let retval = {
        "followerCount": twitchFollowerInfo["total"],
        "subCount": channelSubs["totalSubs"],
        "viewerCount": viewerCount,
        "gameName": gameName,
        isLive
    };
    console.log(retval);
    return res.json(retval);
}));
exports.default = twitchRouter;
