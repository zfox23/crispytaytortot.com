export interface ScheduleItem {
    id: string;
    startDateTimeRFC3339: string;
    endDateTimeRFC3339: string;
    ianaTimeZoneName: string;
    game: string;
    description?: string;
    iconUrl: string;
    twitchScheduleBroadcastID?: string;
    twitchCategoryID?: string;
}

export interface ScheduleRouterPostAuthorizePayload {
    password: string;
}

export interface ScheduleRouterPostSetPayload {
    password: string;
    schedules: ScheduleItem[];
}

export interface ScheduleRouterPostDeletePayload {
    password: string;
    id: string;
}

export interface ScheduleRouterPostGetPayload {
    password: string;
    scheduleStartDate: string;
}

export interface TwitchRouterPostSchedulePayload {
    password: string;
    startDateString: string;
    endDateString: string;
}

export type CrispyDBScheduleID = string;
export type TwitchScheduleSegmentID = string;

export interface TwitchRouterPostScheduleResponse {
    newScheduledSegmentsMap: Map<CrispyDBScheduleID, TwitchScheduleSegmentID>;
    updatedScheduledSegmentsMap: Map<CrispyDBScheduleID, TwitchScheduleSegmentID>;
}

export interface AddToAndUpdateTwitchScheduleResponse {
    newScheduledSegmentsMap: Map<CrispyDBScheduleID, TwitchScheduleSegmentID>;
    updatedScheduledSegmentsMap: Map<CrispyDBScheduleID, TwitchScheduleSegmentID>;
}

export interface DeleteTwitchScheduleSegmentResponse {
    id: CrispyDBScheduleID;
}

export interface CreateNewTwitchStreamScheduleSegmentsResponse {
    newScheduledSegmentsMap: Map<CrispyDBScheduleID, TwitchScheduleSegmentID>;
}

export interface UpdateTwitchStreamScheduleSegmentsResponse {
    updatedScheduledSegmentsMap: Map<CrispyDBScheduleID, TwitchScheduleSegmentID>;
}

export interface UpdateTwitchCategoryIDCacheResponse {
}



export interface TwitchAPIScheduleSegmentPayload {
    start_time: string;
    timezone: string;
    duration: string;
    is_recurring?: boolean;
    category_id?: string;
    title?: string;
}

export interface TwitchAPICategorySearchData {
    box_art_url: string;
    name: string;
    id: string;
}
export interface TwitchAPICategorySearchResponse {
    data: TwitchAPICategorySearchData[];
}

export interface TwitchAPIScheduleSegments {
    id: string;
    start_time: string;
    end_time: string;
    title: string;
    canceled_until: string;
    category: {
        id: string;
        name: string;
    }
    is_recurring: boolean;
}
export interface TwitchAPIScheduleSegmentData {
    segments: TwitchAPIScheduleSegments[];
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
    vacation: null | {
        start_time: string;
        end_time: string;
    }
}
export interface TwitchAPIScheduleSegmentResponse {
    data: TwitchAPIScheduleSegmentData;
}
