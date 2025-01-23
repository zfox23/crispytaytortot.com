
import { Database } from 'sqlite3';
import { cachedTwitchUserAuthInfo, refreshTwitchUserAccessToken } from './twitch-auth';
import { ScheduleItem, TwitchAPICategorySearchData, TwitchAPICategorySearchResponse, TwitchAPIScheduleSegmentPayload, TwitchAPIScheduleSegmentResponse, CreateNewTwitchStreamScheduleSegmentsResponse, UpdateTwitchCategoryIDCacheResponse, AddToAndUpdateTwitchScheduleResponse, UpdateTwitchStreamScheduleSegmentsResponse, CrispyDBScheduleID, DeleteTwitchScheduleSegmentResponse } from '../../../shared/src/types';
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
    return new Promise<UpdateTwitchCategoryIDCacheResponse>(async (resolve, reject) => {
        let updateResponse: UpdateTwitchCategoryIDCacheResponse = {
        };

        await refreshTwitchUserAccessToken();
        if (!cachedTwitchUserAuthInfo) {
            throw new Error(`Server couldn't refresh Twitch user access token.`);
        }

        const stmt = crispyDB.prepare(`
        SELECT DISTINCT s.game 
        FROM schedules s
        LEFT JOIN twitchCategoryIDCache t ON s.game = t.game
        WHERE t.game IS NULL
    `);
        let rows: ScheduleItem[] | undefined = undefined;
        try {
            rows = await new Promise<ScheduleItem[]>((resolve, reject) => {
                stmt.all((err: Error | null, rows: any[]) => {
                    if (err) {
                        console.error(err.message);
                        return reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } catch (e) {
            return reject(e);
        }

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
                    throw new Error(`Failed to update Twitch Category ID cache for game \`${game}\`: ${await response.text()}`);
                }

                const twitchResponse: TwitchAPICategorySearchResponse = await response.json();

                const twitchResponseData = twitchResponse.data;

                const matchingIdx = twitchResponseData.findIndex((i: TwitchAPICategorySearchData) => {
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

            return resolve(updateResponse);
        } catch (error) {
            throw new Error(`Error when updating Twitch Category ID cache: ${error}`);
        }
    })
}

const createNewTwitchStreamScheduleSegments = async (startDate: Date, endDate: Date) => {
    return new Promise<CreateNewTwitchStreamScheduleSegmentsResponse>(async (resolve, reject) => {
        let scheduleSegmentResponse: CreateNewTwitchStreamScheduleSegmentsResponse = {
            newScheduledSegmentsMap: new Map()
        };

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


        let rows: ScheduleItem[] | undefined = undefined;
        try {
            rows = await new Promise<ScheduleItem[]>((resolve, reject) => {
                stmt.all(startDate.toISOString(), endDate.toISOString(), (err: Error | null, rows: any[]) => {
                    if (err) {
                        console.error(err.message);
                        return reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } catch (e: any) {
            throw new Error(e);
        }

        for (const row of rows) {
            if (!row.twitchCategoryID) {
                console.warn(`No Twitch category ID found for game \`${row.game}\`. Skipping this schedule item.`);
                continue;
            }

            // const url = `https://api.twitch.tv/helix/schedule/segment/?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}`;
            const url = `https://zachfox.io`;

            const headers = {
                'Authorization': `Bearer ${cachedTwitchUserAuthInfo.access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID!,
                'Content-Type': 'application/json'
            };

            const requestBody: TwitchAPIScheduleSegmentPayload = {
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
                throw new Error(`Failed to create schedule segment for row ${row.id}: ${await response.text()}`);
            }

            const json: TwitchAPIScheduleSegmentResponse = await response.json();

            scheduleSegmentResponse.newScheduledSegmentsMap.set(row.id, json.data.segments[0].id);

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
                throw new Error(`Failed to update \`twitchScheduleBroadcastID\` in CrispyDB for row ${row.id}: ${e}`);
            }

            console.log(`Successfully created schedule segment for row \`${row.id}\``);
        }

        resolve(scheduleSegmentResponse);
    })
}

const updateTwitchStreamScheduleSegments = async (startDate: Date, endDate: Date) => {
    return new Promise<UpdateTwitchStreamScheduleSegmentsResponse>(async (resolve, reject) => {
        let updateScheduledSegmentsResponse: UpdateTwitchStreamScheduleSegmentsResponse = {
            updatedScheduledSegmentsMap: new Map()
        };

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
                  AND s.twitchScheduleBroadcastID IS NOT NULL
                ORDER BY s.startDateTimeRFC3339`);


        let rows: ScheduleItem[] | undefined = undefined;
        try {
            rows = await new Promise<ScheduleItem[]>((resolve, reject) => {
                stmt.all(startDate.toISOString(), endDate.toISOString(), (err: Error | null, rows: any[]) => {
                    if (err) {
                        console.error(err.message);
                        return reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } catch (e: any) {
            throw new Error(e);
        }

        for (const row of rows) {
            if (!row.twitchCategoryID) {
                console.warn(`No Twitch category ID found for game \`${row.game}\`. Skipping this schedule item.`);
                continue;
            }

            // const url = `https://api.twitch.tv/helix/schedule/segment/?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}&id=${row.twitchScheduleBroadcastID}`;
            const url = `https://zachfox.io`;

            const headers = {
                'Authorization': `Bearer ${cachedTwitchUserAuthInfo.access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID!,
                'Content-Type': 'application/json'
            };

            const requestBody: TwitchAPIScheduleSegmentPayload = {
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
                method: 'PATCH',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to create schedule segment for row ${row.id}: ${await response.text()}`);
            }

            const json: TwitchAPIScheduleSegmentResponse = await response.json();

            updateScheduledSegmentsResponse.updatedScheduledSegmentsMap.set(row.id, json.data.segments[0].id);

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
                throw new Error(`Failed to update \`twitchScheduleBroadcastID\` in CrispyDB for row ${row.id}: ${e}`);
            }

            console.log(`Successfully updated schedule segment for row \`${row.id}\``);
        }

        resolve(updateScheduledSegmentsResponse);
    })
}

export const addToAndUpdateTwitchScheduleSegments = (startDate: Date, endDate: Date) => {
    return new Promise<AddToAndUpdateTwitchScheduleResponse>(async (resolve, reject) => {
        let response: AddToAndUpdateTwitchScheduleResponse = {
            newScheduledSegmentsMap: new Map(),
            updatedScheduledSegmentsMap: new Map(),
        }

        let updateCacheResponse;
        try {
            updateCacheResponse = await updateTwitchCategoryIDCache();
        } catch (e: any) {
            throw new Error(e);
        }

        let scheduleSegmentResponse: CreateNewTwitchStreamScheduleSegmentsResponse;
        try {
            scheduleSegmentResponse = await createNewTwitchStreamScheduleSegments(startDate, endDate);
            response.newScheduledSegmentsMap = scheduleSegmentResponse.newScheduledSegmentsMap;
        } catch (e: any) {
            throw new Error(e);
        }

        let updateScheduledSegmentResponse: UpdateTwitchStreamScheduleSegmentsResponse;
        try {
            updateScheduledSegmentResponse = await updateTwitchStreamScheduleSegments(startDate, endDate);
            response.updatedScheduledSegmentsMap = updateScheduledSegmentResponse.updatedScheduledSegmentsMap;
        } catch (e: any) {
            throw new Error(e);
        }

        resolve(response);
    })
}

export const deleteTwitchScheduleSegment = (id: CrispyDBScheduleID) => {
    return new Promise<DeleteTwitchScheduleSegmentResponse>(async (resolve, reject) => {

        const stmt = crispyDB.prepare(`
            SELECT 
                s.id,
                s.twitchScheduleBroadcastID
            FROM schedules s
            WHERE s.id = (?)`);


        let rows: ScheduleItem[] | undefined = undefined;
        try {
            rows = await new Promise<ScheduleItem[]>((resolve, reject) => {
                stmt.all(id,
                    (err: Error | null, rows: any[]) => {
                        if (err) {
                            console.error(err.message);
                            return reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
            });
        } catch (e: any) {
            throw new Error(e);
        }

        let response: DeleteTwitchScheduleSegmentResponse = {
            id
        }

        for (const row of rows) {
            if (!row.twitchScheduleBroadcastID) {
                throw new Error(`No \`twitchScheduleBroadcastID\` found for row ID \`${row.id}\``);
            }

            // const url = `https://api.twitch.tv/helix/schedule/segment/?broadcaster_id=${process.env.TWITCH_BROADCASTER_ID}&id=${row.twitchScheduleBroadcastID}`;
            const url = `https://zachfox.io`;

            const headers = {
                'Authorization': `Bearer ${cachedTwitchUserAuthInfo.access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID!,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`Failed to delete schedule segment for row ${row.id}: ${await response.text()}`);
            }

            console.log(`Successfully deleted Twitch schedule segment for row \`${row.id}\``);
        }

        resolve(response);
    })
}
