import express, { Response } from 'express';
import { cachedTwitchUserAuthInfo, refreshTwitchUserAccessToken } from './twitch-auth';
import { getChannelSubs, getStreams, getTwitchFollowerInfo } from './twitch';
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

export default twitchRouter;
