import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import { cachedTwitchUserAuthInfo, refreshTwitchUserAccessToken } from './twitch-auth';
import { addToAndUpdateTwitchScheduleSegments, getChannelSubs, getStreams, getTwitchFollowerInfo } from './twitch';
import { AddToAndUpdateTwitchScheduleResponse, TwitchRouterPostSchedulePayload, TwitchRouterPostScheduleResponse } from '../../../shared/src/types';
import { hashedSecretPassword } from '../schedule/schedule-routes';
const twitchRouter = express.Router();

twitchRouter.get("/info", async (req, res: Response) => {
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
    let isLive = false;
    if (streamsInfo.ok && streamsInfo.streamsInfoJSON.data.length > 0) {
        viewerCount = streamsInfo.streamsInfoJSON.data[0].viewer_count;
        gameName = streamsInfo.streamsInfoJSON.data[0].game_name
        isLive = streamsInfo.streamsInfoJSON.data[0].type === "live";
    }

    let retval = {
        "followerCount": twitchFollowerInfo["total"],
        "subCount": channelSubs["totalSubs"],
        "viewerCount": viewerCount,
        "gameName": gameName,
        isLive
    }

    return res.json(retval);
})

twitchRouter.post("/schedule", async (req, res: Response) => {
    const payload: TwitchRouterPostSchedulePayload = req.body;
    let response: TwitchRouterPostScheduleResponse = {
        newScheduledSegmentsMap: new Map(),
        updatedScheduledSegmentsMap: new Map(),
    }

    if (!(payload && payload.startDateString)) {
        return res.status(400).send('Invalid payload');
    }

    const password = payload.password;
    const isPasswordValid = await bcrypt.compare(password, hashedSecretPassword);

    if (!isPasswordValid) {
        console.warn(`Someone at ${req.ip} tried and failed to update the Twitch schedule.`);
        return res.status(401).send('Unauthorized');
    }

    await refreshTwitchUserAccessToken();
    if (!cachedTwitchUserAuthInfo) {
        return res.status(500).send(`Server couldn't refresh Twitch user access token.`);
    }

    let addToAndUpdateTwitchScheduleResponse: AddToAndUpdateTwitchScheduleResponse;
    try {
        addToAndUpdateTwitchScheduleResponse = await addToAndUpdateTwitchScheduleSegments(new Date(payload.startDateString), new Date(payload.endDateString));
        response.newScheduledSegmentsMap = addToAndUpdateTwitchScheduleResponse.newScheduledSegmentsMap;
        response.updatedScheduledSegmentsMap = addToAndUpdateTwitchScheduleResponse.updatedScheduledSegmentsMap;
    } catch (e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(response);
})

export default twitchRouter;
