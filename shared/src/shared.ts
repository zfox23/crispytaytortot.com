const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const translateScheduleItemIntoISOTime = (dateString: string, time: undefined | string) => {
    const [year, month, date] = dateString.split('-').map(Number);
    if (!time) { time = "00:00"; }
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date(year, month - 1, date, hours, minutes);

    const isoTime = d.toISOString();

    return isoTime;
}

export const translateISOTimeIntoScheduleItem = (isoTime: string) => {
    const date = new Date(isoTime);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Format the time component (HH:MM)
    let time;
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (hours === 0 && minutes === 0) {
        time = undefined;
    } else {
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        time = `${formattedHours}:${formattedMinutes}`;
    }

    return { dateString, time };
}