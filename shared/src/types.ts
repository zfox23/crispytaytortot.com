export interface ScheduleItem {
    id: string;
    dateString: string;
    time?: string;
    game: string;
    description?: string;
    iconUrl?: string;
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

