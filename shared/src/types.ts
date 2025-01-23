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

export interface AuthorizePayload {
    password: string;
}

export interface SetSchedulePayload {
    password: string;
    schedules: ScheduleItem[];
}

export interface DeleteScheduleItemPayload {
    password: string;
    id: string;
}

export interface GetSchedulePayload {
    password: string;
    scheduleStartDate: string;
}

export interface SetTwitchSchedulePayload {
    password: string;
    startDateString: string;
    endDateString: string;
}

export interface TwitchScheduleSegmentBody {
    start_time: string;
    timezone: string;
    duration: string;
    is_recurring?: boolean;
    category_id?: string;
    title?: string;
}

export interface TwitchCategoryData {
    box_art_url: string;
    name: string;
    id: string;
}

export interface TwitchCategorySearchResponseBody {
    data: TwitchCategoryData[];
}

export interface TwitchScheduleSegments {
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

export interface TwitchScheduleSegmentsData {
    segments: TwitchScheduleSegments[];
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
    vacation: null | {
        start_time: string;
        end_time: string;
    }
}

export interface TwitchScheduleSegmentReponseBody {
    data: TwitchScheduleSegmentsData;
}
