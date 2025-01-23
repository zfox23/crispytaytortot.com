export const SCHEDULED_STREAM_LIMIT_MINUTES = 23 * 60;

export const computeDurationInMinutes = (startDateTimeString: string, endDateTimeString: string): number => {
    const startDate = new Date(startDateTimeString);
    const endDate = new Date(endDateTimeString);
    return Math.round(endDate.getTime() - startDate.getTime()) / (1000 * 60);
};

export const rfc3339ToLocalYYYYMMDDTHHMM = (rfc3339String: string, ianaTimeZoneName: string) => {
    const date = new Date(rfc3339String);
    return date.toLocaleString('en-ca', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: ianaTimeZoneName
    }).replace(/\/|\s/g, 'T').replace(',', '');
}

export const validateEndTime = (startDateTimeString: string, endDateTimeString: string) => {
    if (computeDurationInMinutes(startDateTimeString, endDateTimeString) > SCHEDULED_STREAM_LIMIT_MINUTES) {
        return `Maximum stream duration is ${Math.round(SCHEDULED_STREAM_LIMIT_MINUTES / 60)} hours.`;
    } else if (new Date(endDateTimeString) < new Date(startDateTimeString)) {
        return "End date must be after start date";
    } else {
        return "";
    }
}
