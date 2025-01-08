export interface ScheduleItem {
    id: string;
    dateString: string;
    time?: string;
    game: string;
    description?: string;
    iconUrl?: string; // Store the icon URL
}

export interface ScheduleUpdatePayload {
    schedules: ScheduleItem[],
    password: string
}

export interface ScheduleImportPayload {
    scheduleStartDate: string,
    password: string
}

