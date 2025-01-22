
import { Database } from 'sqlite3';
import { cachedTwitchUserAuthInfo } from './twitch-auth';
import { ScheduleItem } from '../../../shared/src/types';

// https://discuss.dev.twitch.tv/t/get-stream-total-live-views/28891
// Total stream views is deprecated.
export const getChannelSubs = async () => {
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

export const getStreams = async () => {
    const myHeaders = new Headers();
    myHeaders.set('Authorization', `Bearer ${cachedTwitchUserAuthInfo.access_token}`);
    myHeaders.set('Client-Id', process.env.TWITCH_CLIENT_ID!);
    let error;

    let streamsInfo;
    try {
        streamsInfo = await fetch(`https://api.twitch.tv/helix/streams?user_id=${process.env.TWITCH_BROADCASTER_ID}`,
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

export const getTwitchFollowerInfo = async () => {
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

export const updateTwitchSchedule = (db: Database, startDate: Date, endDate: Date) => {
    return new Promise<void>(async (resolve, reject) => {
        const stmt = db.prepare(`SELECT id, startDateTimeRFC3339, endDateTimeRFC3339, game FROM schedules WHERE date(startDateTimeRFC3339) BETWEEN date(?) AND date(?) ORDER BY startDateTimeRFC3339`);
        const rows = await new Promise<ScheduleItem[]>((resolve, reject) => {
            stmt.all(startDate.toISOString(), endDate.toISOString(), (err: Error | null, rows: any[]) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    })
}
