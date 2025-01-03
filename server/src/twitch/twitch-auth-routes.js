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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const twitch_auth_1 = require("./twitch-auth");
const csrf_csrf_1 = require("csrf-csrf");
const twitchAuthRouter = express_1.default.Router();
const { generateToken, validateRequest, } = (0, csrf_csrf_1.doubleCsrf)({
    getSecret: () => process.env.CSRF_SECRET,
    cookieName: "x-csrf-token",
    cookieOptions: { sameSite: false, secure: false, signed: true }, // not ideal for production, development only
    getTokenFromRequest: (req) => { var _a; return (_a = req.query.state) === null || _a === void 0 ? void 0 : _a.toString(); },
});
twitchAuthRouter.get("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!validateRequest(req)) {
        return res.status(403).send(`Couldn't validate your request.`);
    }
    if (req.query.error) {
        return res.send(req.query.error_description);
    }
    if (!req.query.code) {
        return res.sendStatus(500);
    }
    const twitchUserAuthInfo = yield (0, twitch_auth_1.getTwitchUserAuthInfo)(req.query.code.toString());
    const { id, login } = yield (0, twitch_auth_1.getUserIDFromAccessToken)(twitchUserAuthInfo.access_token);
    if (id === process.env.TWITCH_BROADCASTER_ID) {
        (0, twitch_auth_1.setCachedTwitchUserAuthInfo)(JSON.parse(JSON.stringify(twitchUserAuthInfo)));
        const userAccessTokenJSONPath = path_1.default.join(__dirname, "userAccessToken.json");
        (0, fs_1.writeFileSync)(userAccessTokenJSONPath, JSON.stringify(twitchUserAuthInfo));
        return res.send(`Welcome, ${login}. You have successfully authorized crispytaytortot.com, and it will start showing data now.`);
    }
    else if (id === "686688") {
        const userAccessTokenJSONPath = path_1.default.join(__dirname, "userAccessToken.json");
        (0, twitch_auth_1.setCachedTwitchUserAuthInfo)(JSON.parse(JSON.stringify(twitchUserAuthInfo)));
        (0, fs_1.writeFileSync)(userAccessTokenJSONPath, JSON.stringify(twitchUserAuthInfo));
        return res.send(`hi zach 😁`);
    }
    else {
        return res.status(401).send(`You aren't allowed to authorize this application. Your data has been discarded.`);
    }
}));
twitchAuthRouter.get("/connect", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const csrfToken = generateToken(res, req);
    const forceVerify = true;
    return res.redirect(`https://id.twitch.tv/oauth2/authorize?response_type=code&${forceVerify ? "force_verify=true&" : ""}client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&scope=channel%3Aread%3Asubscriptions+moderator%3Aread%3Afollowers&state=${csrfToken}`);
}));
exports.default = twitchAuthRouter;
