export const SCHEDULED_STREAM_LIMIT_HOURS = 23;

export const computeDurationInHours = (startDateTimeRFC3339: string, endDateTimeRFC3339: string): number => {
    const startDate = new Date(startDateTimeRFC3339);
    const endDate = new Date(endDateTimeRFC3339);
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
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

