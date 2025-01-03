import express from 'express';
import { writeFileSync } from 'fs';
import path from 'path';
import { getTwitchUserAuthInfo, getUserIDFromAccessToken, setCachedTwitchUserAuthInfo } from './twitch-auth';
import { doubleCsrf } from 'csrf-csrf';
const twitchAuthRouter = express.Router();

const {
    generateToken,
    validateRequest,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,
    cookieName: "x-csrf-token",
    cookieOptions: { sameSite: false, secure: false, signed: true }, // not ideal for production, development only
    getTokenFromRequest: (req) => req.query.state?.toString(),
});

twitchAuthRouter.get("/auth", async (req, res) => {
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
        setCachedTwitchUserAuthInfo(JSON.parse(JSON.stringify(twitchUserAuthInfo)));
        const userAccessTokenJSONPath = path.join(__dirname, "userAccessToken.json");
        writeFileSync(userAccessTokenJSONPath, JSON.stringify(twitchUserAuthInfo));
        return res.send(`Welcome, ${login}. You have successfully authorized crispytaytortot.com, and it will start showing data now.`);
    } else if (id === "686688") {
        const userAccessTokenJSONPath = path.join(__dirname, "userAccessToken.json");
        setCachedTwitchUserAuthInfo(JSON.parse(JSON.stringify(twitchUserAuthInfo)));
        writeFileSync(userAccessTokenJSONPath, JSON.stringify(twitchUserAuthInfo));
        return res.send(`hi zach 😁`);
    } else {
        return res.status(401).send(`You aren't allowed to authorize this application. Your data has been discarded.`);
    }
})

twitchAuthRouter.get("/connect", async (req, res) => {
    const csrfToken = generateToken(res as any, req as any);
    const forceVerify = true;
    return res.redirect(`https://id.twitch.tv/oauth2/authorize?response_type=code&${forceVerify ? "force_verify=true&" : ""}client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&scope=channel%3Aread%3Asubscriptions+moderator%3Aread%3Afollowers&state=${csrfToken}`)
})

export default twitchAuthRouter;
