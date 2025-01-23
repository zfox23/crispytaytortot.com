
import { Database } from 'sqlite3';
import { cachedTwitchUserAuthInfo, refreshTwitchUserAccessToken } from './twitch-auth';
import { ScheduleItem, TwitchCategoryData, TwitchCategorySearchResponseBody, TwitchScheduleSegmentBody, TwitchScheduleSegmentReponseBody } from '../../../shared/src/types';
import { computeDurationInMinutes } from '../../../shared/src/shared';
import { crispyDB } from '../database/db';
import { Response } from 'express';

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

export const updateTwitchCategoryIDCache = async () => {
    await refreshTwitchUserAccessToken();
    if (!cachedTwitchUserAuthInfo) {
        return `Server couldn't refresh Twitch user access token.`;
    }

    const stmt = crispyDB.prepare(`
    SELECT s.game 
    FROM schedules s
    LEFT JOIN twitchCategoryIDCache t ON s.game = t.game
    WHERE t.game IS NULL
`);
    const rows = await new Promise<ScheduleItem[]>((resolve, reject) => {
        stmt.all((err: Error | null, rows: any[]) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });

    try {
        for (const row of rows) {
            const game = row.game;

            console.log(`Need to update \`${game}\` in the \`twitchCategoryIDCache\`. Searching Twitch categories via API...`);

            const url = `https://api.twitch.tv/helix/search/categories/?query=${encodeURIComponent(game)}`;

            const headers = {
                'Authorization': `Bearer ${cachedTwitchUserAuthInfo.access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID!,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                return `Failed to update Twitch Category ID cache for game \`${game}\`: ${await response.text()}`;
            }

            const twitchResponse: TwitchCategorySearchResponseBody = await response.json();

            const twitchResponseData = twitchResponse.data;

            const matchingIdx = twitchResponseData.findIndex((i: TwitchCategoryData) => {
                return i.name === game;
            })

            let twitchCategoryName = twitchResponse.data[0].name;
            let twitchCategoryID = twitchResponse.data[0].id;
            if (matchingIdx > -1) {
                twitchCategoryName = twitchResponse.data[matchingIdx].name;
                twitchCategoryID = twitchResponse.data[matchingIdx].id;
            }

            console.log(game, twitchCategoryName, twitchCategoryID);

            const stmt = crispyDB.prepare(`REPLACE INTO twitchCategoryIDCache (game, twitchCategoryName, twitchCategoryID) VALUES (?, ?, ?)`);

            await new Promise<void>((resolve, reject) => {
                stmt.run(
                    game,
                    twitchCategoryName,
                    twitchCategoryID,
                    (err: Error) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }

        return '';
    } catch (error) {
        return `Error when updating Twitch Category ID cache: ${error}`;
    }
}

const createNewTwitchStreamScheduleSegments = async (startDate: Date, endDate: Date) => {
    const stmt = crispyDB.prepare(`
            SELECT 
                s.id, 
                s.startDateTimeRFC3339, 
                s.endDateTimeRFC3339, 
                s.ianaTimeZoneName, 
                s.game, 
                s.description,
                t.twitchCategoryID
            FROM schedules s
            LEFT JOIN twitchCategoryIDCache t ON s.game = t.game
            WHERE date(s.startDateTimeRFC3339) BETWEEN date(?) AND date(?)
              AND s.twitchScheduleBroadcastID IS NULL
            ORDER BY s.startDateTimeRFC3339`);
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

    for (const row of rows) {
        if (!row.twitchCategoryID) {
            console.warn(`No Twitch category ID found for game \`${row.game}\`. Skipping this schedule item.`);
            continue;
        }

        // const url = `https://api.twitch.tv/helix/schedule/segment/${process.env.TWITCH_BROADCASTER_ID}`;
        const url = `https://zachfox.io`;

        const headers = {
            'Authorization': `Bearer ${cachedTwitchUserAuthInfo.access_token}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID!,
            'Content-Type': 'application/json'
        };

        const requestBody: TwitchScheduleSegmentBody = {
            start_time: row.startDateTimeRFC3339,
            timezone: row.ianaTimeZoneName,
            duration: computeDurationInMinutes(row.startDateTimeRFC3339, row.endDateTimeRFC3339).toString(),
            is_recurring: false,
            category_id: row.twitchCategoryID,
        }

        if (row.description) {
            requestBody["title"] = row.description;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            return `Failed to create schedule segment for row ${row.id}: ${await response.text()}`;
        }

        const json: TwitchScheduleSegmentReponseBody = await response.json();

        const stmt = crispyDB.prepare(`REPLACE INTO schedules (id, twitchScheduleBroadcastID) VALUES (?, ?)`);

        try {
            await new Promise<string>((resolve, reject) => {
                stmt.run(
                    row.id,
                    json.data.segments[0].id,
                    (err: Error) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                        } else {
                            resolve('');
                        }
                    }
                );
            });
        } catch (e) {
            return `Failed to update \`twitchScheduleBroadcastID\` in CrispyDB for row ${row.id}: ${e}`;
        }

        console.log(`Successfully created schedule segment for row \`${row.id}\``);
    }

    return '';
}

export const addToOrUpdateTwitchSchedule = async (res: Response, startDate: Date, endDate: Date) => {
    const updateTwitchCategoryIDCacheStatus = await updateTwitchCategoryIDCache();

    if (updateTwitchCategoryIDCacheStatus) {
        console.error(updateTwitchCategoryIDCacheStatus);
        return res.status(500).send(updateTwitchCategoryIDCacheStatus);
    }


    const createNewTwitchStreamScheduleSegmentsStatus = await createNewTwitchStreamScheduleSegments(startDate, endDate);

    if (createNewTwitchStreamScheduleSegmentsStatus) {
        console.error(createNewTwitchStreamScheduleSegmentsStatus);
        return res.status(500).send(createNewTwitchStreamScheduleSegmentsStatus);
    }

    res.status(200).send("Success");
}
