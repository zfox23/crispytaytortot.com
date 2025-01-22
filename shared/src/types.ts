export interface ScheduleItem {
    id: string;
    startDateTimeRFC3339: string;
    endDateTimeRFC3339: string;
    ianaTimeZoneName: string;
    game: string;
    description?: string;
    iconUrl: string;
    twitchScheduleBroadcastID?: string;
}

export interface AuthorizePayload {
    password: string
}

export interface SetSchedulePayload {
    schedules: ScheduleItem[],
    password: string
}

export interface DeleteScheduleItemPayload {
    id: string,
    password: string
}

export interface GetSchedulePayload {
    scheduleStartDate: string,
    password: string
}

