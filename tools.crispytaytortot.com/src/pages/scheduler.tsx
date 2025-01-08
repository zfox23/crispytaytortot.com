import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon, CloudArrowDownIcon, CloudArrowUpIcon, CodeBracketIcon, LockClosedIcon, LockOpenIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import SEOHeader from '../components/SEOHeader';
import { Footer } from '../../../crispytaytortot.com/src/components/Footer';
import { Background } from '../../../crispytaytortot.com/src/components/Background';
import { AuthorizePayload, DeleteScheduleItemPayload, GetSchedulePayload, ScheduleItem, SetSchedulePayload } from '../../../shared/src/types';
import { Header } from '../components/Header';

const isBrowser = typeof window !== "undefined";

let bgImage, twitchIcon, youTubeIcon, blueskyIcon, tiktokIcon;

if (isBrowser) {
    bgImage = new Image();
    bgImage.src = '/images/tot-bg.jpg';
    bgImage.crossOrigin = "anonymous";

    twitchIcon = new Image();
    const twitchIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg width="256px" height="268px" preserveAspectRatio="xMidYMid" version="1.1" viewBox="0 0 256 268" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff">
    <path d="m17.458 0-17.458 46.556v186.2h63.983v34.934h34.932l34.897-34.934h52.36l69.828-69.803v-162.95h-238.54zm23.259 23.263h192.01v128.03l-40.739 40.742h-63.992l-34.887 34.885v-34.885h-52.396v-168.77zm64.008 116.41h23.275v-69.825h-23.275v69.825zm63.997 0h23.27v-69.825h-23.27v69.825z" fill="#fff"/>
    </g>
    </svg>`], { type: 'image/svg+xml' });
    const twitchIconURL = URL.createObjectURL(twitchIconBlob);
    twitchIcon.src = twitchIconURL;
    twitchIcon.crossOrigin = "anonymous";

    youTubeIcon = new Image();
    const youTubeIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg width="756.99" height="533.33" version="1.1" viewBox="-35.2 -41.333 192.44 165.33" xmlns="http://www.w3.org/2000/svg">
     <path d="m37.277 76.226v-69.784l61.334 34.893zm136.43-91.742c-2.699-10.162-10.651-18.165-20.747-20.881-18.3-4.936-91.683-4.936-91.683-4.936s-73.382 0-91.682 4.936c-10.096 2.716-18.048 10.719-20.747 20.881-4.904 18.419-4.904 56.85-4.904 56.85s0 38.429 4.904 56.849c2.699 10.163 10.65 18.165 20.747 20.883 18.3 4.934 91.682 4.934 91.682 4.934s73.383 0 91.683-4.934c10.096-2.718 18.048-10.72 20.747-20.883 4.904-18.42 4.904-56.85 4.904-56.85s0-38.43-4.904-56.849" fill="#fff"/>
    </svg>`], { type: 'image/svg+xml' });
    const youTubeIconURL = URL.createObjectURL(youTubeIconBlob);
    youTubeIcon.src = youTubeIconURL;
    youTubeIcon.crossOrigin = "anonymous";

    blueskyIcon = new Image();
    const blueskyIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg fill="#FFFFFF" aria-hidden="true" version="1.1" viewBox="0 0 580 510.68" xmlns="http://www.w3.org/2000/svg">
     <path d="m125.72 34.375c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" clip-rule="evenodd" fill-rule="evenodd"/>
    </svg>`], { type: 'image/svg+xml' });
    const blueskyIconURL = URL.createObjectURL(blueskyIconBlob);
    blueskyIcon.src = blueskyIconURL;
    blueskyIcon.crossOrigin = "anonymous";

    tiktokIcon = new Image();
    const tiktokIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg clip-rule="evenodd" fill-rule="evenodd" image-rendering="optimizeQuality" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" version="1.1" viewBox="0 0 2859 3333" xmlns="http://www.w3.org/2000/svg">
     <path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z" fill="#fff"/>
    </svg>`], { type: 'image/svg+xml' });
    const tiktokIconURL = URL.createObjectURL(tiktokIconBlob);
    tiktokIcon.src = tiktokIconURL;
    tiktokIcon.crossOrigin = "anonymous";
}

const Scheduler: React.FC = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [rememberMe, setRememberMe] = useState(isBrowser && !!localStorage.getItem('crispyDBPassword'));
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [scheduleImportStartDate, setScheduleImportStartDate] = useState('');
    const [sevenDaysLaterDate, setSevenDaysLaterDate] = useState('');
    const [dateString, setDateString] = useState('');
    const [time, setTime] = useState('');
    const [game, setGame] = useState('');
    const [description, setDescription] = useState('');
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
    const [editedDateString, setEditedDateString] = useState('');
    const [editedTime, setEditedTime] = useState('');
    const [editedGame, setEditedGame] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [operationStatus, setOperationStatus] = useState('');

    const dateStringInputRef = useRef<HTMLInputElement | null>(null);
    const timeInputRef = useRef<HTMLInputElement | null>(null);
    const gameInputRef = useRef<HTMLInputElement | null>(null);
    const descriptionInputRef = useRef<HTMLInputElement | null>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const importJsonTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scheduleImportStartDate) {
            const date = new Date(scheduleImportStartDate);
            date.setDate(date.getDate() + 7);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(date.getDate()).padStart(2, '0');
            setSevenDaysLaterDate(`${year}-${month}-${day}`);
        } else {
            setSevenDaysLaterDate('');
        }
    }, [scheduleImportStartDate]);

    useEffect(() => {
        if (!passwordInputRef.current) return;

        const storedPassword = localStorage.getItem('crispyDBPassword');
        if (storedPassword) {
            passwordInputRef.current.value = storedPassword;
        }

        authorizeCrispyDB();
    }, []);

    const getPreviousMonday = () => {
        // Get today's date
        const today = new Date();

        // Calculate the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
        const currentDayOfWeek = today.getDay();

        // Calculate how many days to subtract to get to the previous Monday
        // If today is Monday (1), we need to subtract 7 - 1 = 6 days to get to the previous Monday
        // If today is Sunday (0), we need to subtract 7 - 0 = 7 days to get to the previous Monday
        const daysToPreviousMonday = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;

        // Create a new date for the previous Monday
        const previousMonday = new Date(today);
        previousMonday.setDate(today.getDate() - daysToPreviousMonday);

        // Format the date in YYYY-MM-DD format
        const year = previousMonday.getFullYear();
        const month = String(previousMonday.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(previousMonday.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }


    useEffect(() => {
        const nextMonday = getPreviousMonday();
        setScheduleImportStartDate(nextMonday);
    }, [])

    useEffect(() => {
        renderSchedule();
        saveScheduleAsJSON();
    }, [schedules]);

    const addSchedule = (event: React.FormEvent) => {
        event.preventDefault();
        if (dateString && game) {
            setSchedules([...schedules, { id: crypto.randomUUID(), dateString, time, game, description }]);
            setDateString('');
            setTime('');
            setGame('');
            setDescription('');
        }
    };

    const editSchedule = (id: string) => {
        const scheduleToEdit = schedules.find((schedule) => schedule.id === id);
        if (!scheduleToEdit) return;

        setEditingScheduleId(id);
        setEditedDateString(scheduleToEdit.dateString);
        setEditedTime(scheduleToEdit.time || "");
        setEditedGame(scheduleToEdit.game);
        setEditedDescription(scheduleToEdit.description || "");
    };

    const removeSchedule = async (id: string) => {
        if (!passwordInputRef.current) return;

        const password = passwordInputRef.current.value;
        if (!password) {
            setOperationStatus('Password is required.');
            return;
        }


        const payload: DeleteScheduleItemPayload = {
            id,
            password,
        };

        try {
            const response = await fetch('/api/v1/schedule/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Deleted schedule item successfully:', result);
                setSchedules(schedules.filter((schedule) => schedule.id !== id));
                setOperationStatus("Deleted schedule item from CrispyDB successfully!")
            } else {
                const errorData = await response.text();
                console.error('Failed to delete schedule item:', errorData);
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
        }

    };

    const saveScheduleChanges = (id: string) => {
        setSchedules((prevSchedules) =>
            prevSchedules.map((schedule) =>
                schedule.id === id
                    ? {
                        ...schedule,
                        dateString: editedDateString,
                        time: editedTime,
                        game: editedGame,
                        description: editedDescription
                    }
                    : schedule
            )
        );
        setEditingScheduleId(null);
    };

    const sortSchedules = (inputSchedules: ScheduleItem[]) => {
        const sortedSchedules = [...inputSchedules].sort((a, b) => {
            // Compare date strings lexicographically
            const dateStringComparison = a.dateString.localeCompare(b.dateString);
            if (dateStringComparison !== 0) {
                return dateStringComparison;
            }

            // If dates are the same, compare times
            if (a.time && !b.time) {
                return 1;
            } else if (!a.time && b.time) {
                return -1;
            } else if (a.time && b.time) {
                return a.time.localeCompare(b.time);
            }

            // If both time and date are the same, consider them equal
            return 0;
        });

        return sortedSchedules;
    }

    const fetchAppIdAndIcon = async (gameName: string): Promise<{ iconUrl: string }> => {
        if (!gameName) {
            return { iconUrl: "/images/crispytaytortot-70x70.png" };
        }

        try {
            // Fetch game details from the proxy server
            const response = await fetch(`/api/v1/steam/search-game?gameName=${encodeURIComponent(gameName)}`);
            let responseJSON = await response.json();

            if (!(responseJSON && responseJSON.iconUrl)) {
                return { iconUrl: "/images/crispytaytortot-70x70.png" };
            }

            return responseJSON;
        } catch (error) {
            console.error('Error fetching game details:', error);
            return { iconUrl: "/images/crispytaytortot-70x70.png" };
        }
    };

    const formatDateRange = (startDate, endDate) => {
        const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
        const startDay = startDate.getDate();
        const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
        const endDay = endDate.getDate();
        const year = endDate.getFullYear();

        if (startMonth === endMonth) {
            return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        }
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }

    const formatScheduleTableTimeString = (timeValue) => {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12) || 12; // Convert to 12-hour format
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    const formatScheduleImageTimeString = (timeValue) => {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const now = new Date();
        const inputDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Format local time
        const localTime = inputDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: "short", hour12: true });
        const utcTime = inputDate.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric', timeZoneName: "short", hour12: false });

        return `${localTime} / ${utcTime}`;
    }

    const renderFooter = (ctx: CanvasRenderingContext2D, canvas) => {
        const FOOTER_HEIGHT_PX = 96;

        ctx.fillStyle = "#1f1f23DD";
        ctx.beginPath();
        ctx.rect(0, canvas.height - FOOTER_HEIGHT_PX, canvas.width, FOOTER_HEIGHT_PX);
        ctx.fill();

        ctx.fillStyle = "#1f1f23";
        ctx.beginPath();
        ctx.rect(0, canvas.height - (FOOTER_HEIGHT_PX + 1), canvas.width, 1);
        ctx.fill();

        let FOOTER_ICON_PADDING_PX = 24;
        let FOOTER_ICON_WIDTH_PX = 42;
        let FOOTER_ICON_HEIGHT_PX = FOOTER_ICON_WIDTH_PX;
        let FOOTER_ICON_Y_PX = canvas.height - FOOTER_HEIGHT_PX + ((FOOTER_HEIGHT_PX - FOOTER_ICON_HEIGHT_PX) / 2);
        let footerIconX = canvas.width / 2 - (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(tiktokIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);
        footerIconX -= (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(blueskyIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);
        FOOTER_ICON_WIDTH_PX *= 1.5;
        footerIconX -= (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(youTubeIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);
        FOOTER_ICON_WIDTH_PX /= 1.5;
        footerIconX -= (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(twitchIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);

        ctx.fillStyle = "#ffffff";
        ctx.font = '48px tilt-neon';
        ctx.fillText("/crispytaytortot", canvas.width / 2, canvas.height - 36);
    }

    const renderSchedule = async () => {
        const sortedSchedules = sortSchedules(schedules);

        const canvas = document.getElementById('scheduleCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1000;
        canvas.height = 1000;

        ctx.imageSmoothingQuality = "high";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bgImage.complete) {
            ctx.drawImage(bgImage, 0, 0);
        } else {
            bgImage.onload = () => {
                ctx.drawImage(bgImage, 0, 0);
            }
        }

        renderFooter(ctx, canvas);

        let DAY_RECT_BG_BASE_HEIGHT_PX = 96;
        let DAY_RECT_BG_RADII_PX = DAY_RECT_BG_BASE_HEIGHT_PX / 2;
        let GAME_ICON_WIDTH_PX = 64;
        let GAME_ICON_HEIGHT_PX = 64;
        let WEEKDAY_TEXT_HEIGHT_PX = 48;
        let DETAILS_TEXT_HEIGHT_PX = 36;

        let textX = 12;
        let textY = 64;
        let text;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px tilt-neon';

        if (sortedSchedules.length) {
            let [year, month, date] = sortedSchedules[0].dateString.split('-').map(Number);
            const startDate = new Date(year, month - 1, date);
            [year, month, date] = sortedSchedules[sortedSchedules.length - 1].dateString.split('-').map(Number);
            const endDate = new Date(year, month - 1, date);

            text = formatDateRange(startDate, endDate);
            textX = canvas.width / 2;
            ctx.textAlign = "center";
            ctx.fillText(text, textX, textY);
        }

        ctx.textAlign = "start";

        textY += 32;

        let currentDateString: string = "";

        for (let i = 0; i < sortedSchedules.length; i++) {
            let numCurrentDateStrings;
            textX = 32;
            if (currentDateString !== sortedSchedules[i].dateString) {
                currentDateString = sortedSchedules[i].dateString;
                numCurrentDateStrings = sortedSchedules.filter((s) => { return s.dateString === currentDateString; }).length;

                ctx.fillStyle = "#000000AA";
                ctx.beginPath();
                ctx.roundRect(textX, textY, canvas.width - (2 * textX), DAY_RECT_BG_BASE_HEIGHT_PX + ((numCurrentDateStrings - 1) * 82), DAY_RECT_BG_RADII_PX);
                ctx.fill();

                ctx.font = `${WEEKDAY_TEXT_HEIGHT_PX}px tilt-neon`;
                textX += DAY_RECT_BG_RADII_PX / 2;
                textY += DAY_RECT_BG_BASE_HEIGHT_PX / 2 + 15;
                ctx.fillStyle = "#FFFFFF";
                let [year, month, date] = sortedSchedules[i].dateString.split('-').map(Number);
                const d = new Date(year, month - 1, date);
                ctx.fillText(d.toLocaleDateString('en-us', { weekday: 'short' }).toUpperCase(), textX, textY);
                textX += 118;
            } else {
                textX += DAY_RECT_BG_RADII_PX / 2 + 118;
            }
            // Fetch game icon
            const { iconUrl } = await fetchAppIdAndIcon(sortedSchedules[i].game);

            if (iconUrl && sortedSchedules[i].game.toLowerCase() !== "off") {
                const img = new Image();
                img.src = iconUrl;
                img.setAttribute('data-text-x', textX.toString());
                img.setAttribute('data-text-y', (textY - (GAME_ICON_HEIGHT_PX / 4)).toString());
                img.onload = () => {
                    ctx.drawImage(img, parseInt(img.getAttribute('data-text-x') as string), parseInt(img.getAttribute('data-text-y') as string) - (GAME_ICON_HEIGHT_PX / 2), GAME_ICON_WIDTH_PX, GAME_ICON_HEIGHT_PX); // Draw the icon
                };
            }

            textX += GAME_ICON_WIDTH_PX + 12; // Adjust text position to be after the icon (even if there isn't one)

            ctx.font = `${DETAILS_TEXT_HEIGHT_PX}px tilt-neon`;
            const savedTextY = textY;
            if (sortedSchedules[i].time && sortedSchedules[i].game && sortedSchedules[i].description) {
                textY -= (DETAILS_TEXT_HEIGHT_PX - 13);
                text = formatScheduleImageTimeString(sortedSchedules[i].time);
                ctx.fillText(text, textX, textY);
                textY += DETAILS_TEXT_HEIGHT_PX + 2;
                text = `${sortedSchedules[i].game} - ${sortedSchedules[i].description}`;
                ctx.fillText(text, textX, textY);
            } else if (sortedSchedules[i].time && sortedSchedules[i].game && !sortedSchedules[i].description) {
                textY -= (DETAILS_TEXT_HEIGHT_PX - 13);
                text = formatScheduleImageTimeString(sortedSchedules[i].time);
                ctx.fillText(text, textX, textY);
                textY += DETAILS_TEXT_HEIGHT_PX + 2;
                text = `${sortedSchedules[i].game}`;
                ctx.fillText(text, textX, textY);
            } else if (!sortedSchedules[i].time && sortedSchedules[i].game && sortedSchedules[i].description) {
                textY -= 5;
                text = `${sortedSchedules[i].game} - ${sortedSchedules[i].description}`;
                ctx.fillText(text, textX, textY);
            } else if (!sortedSchedules[i].time && sortedSchedules[i].game && !sortedSchedules[i].description) {
                textY -= 5;
                text = `${sortedSchedules[i].game}`;
                ctx.fillText(text, textX, textY);
            }

            if (sortedSchedules[i + 1] && currentDateString !== sortedSchedules[i + 1].dateString) {
                textY = savedTextY + DAY_RECT_BG_BASE_HEIGHT_PX / 2;
            } else {
                textY = savedTextY + 84;
            }
        }
    };

    const saveCanvasAsImage = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'schedule.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const saveScheduleAsJSON = () => {
        if (!importJsonTextareaRef.current) return;

        const jsonContent = JSON.stringify({
            schedules: schedules
        }, null, 2);

        importJsonTextareaRef.current.value = jsonContent;
    };

    const importScheduleFromJSON = () => {
        try {
            if (!importJsonTextareaRef.current) return;
            const jsonContent = importJsonTextareaRef.current.value;
            if (!jsonContent) {
                setSchedules([]);
                setScheduleImportStartDate(new Date().toISOString().split('T')[0]); // Reset to today's date
                return;
            }

            const importedData = JSON.parse(jsonContent);

            if (Array.isArray(importedData.schedules)) {
                setSchedules(importedData.schedules);
                setOperationStatus(`Imported ${importedData.schedules.length} schedule items from JSON - changes not necessarily reflected in CrispyDB`)
            } else {
                setSchedules([]); // Reset schedules if invalid or not provided
            }
        } catch (error) {
            alert('Invalid JSON format. Please check your input and try again.');
        }
    };

    const authorizeCrispyDB = async (event?) => {
        if (event) {
            event.preventDefault();
        }

        if (!passwordInputRef.current) return;

        const password = passwordInputRef.current.value;
        if (!password) {
            setOperationStatus('Password is required.');
            return;
        }


        const payload: AuthorizePayload = {
            password,
        };

        try {
            const response = await fetch('/api/v1/schedule/authorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Authorized successfully:', result);
                setIsAuthorized(true);

                if (rememberMe) {
                    localStorage.setItem('crispyDBPassword', password);
                } else {
                    localStorage.removeItem('crispyDBPassword');
                }
            } else {
                const errorData = await response.text();
                console.error('Failed to authorize:', errorData);
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setIsAuthorized(false);
        }
    }

    const updateCrispyDBSchedule = async (event) => {
        event.preventDefault();

        if (!isAuthorized) {
            setOperationStatus('Authorization is required.');
            return;
        }

        if (!passwordInputRef.current) return;

        const password = passwordInputRef.current.value;
        if (!password) {
            setOperationStatus('Password is required.');
            return;
        }

        const payload: SetSchedulePayload = {
            schedules,
            password,
        };

        try {
            const response = await fetch('/api/v1/schedule/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Schedule updated successfully:', result);
                setOperationStatus(`CrispyDB schedule updated with ${payload.schedules.length} items!`);
            } else {
                const errorData = await response.text();
                console.error('Failed to update schedule:', errorData);
                setOperationStatus('Failed to update CrispyDB schedule. Please try again.');
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setOperationStatus('An error occurred while updating the CrispyDB schedule.');
        }
    };

    const importScheduleFromCrispyDB = async (event) => {
        event.preventDefault();

        if (!isAuthorized) {
            setOperationStatus('Authorization is required.');
            return;
        }

        if (!passwordInputRef.current) return;

        const password = passwordInputRef.current.value;
        if (!password) {
            setOperationStatus('Password is required.');
            return;
        }

        const payload: GetSchedulePayload = {
            scheduleStartDate: scheduleImportStartDate,
            password,
        };

        try {
            const response = await fetch('/api/v1/schedule/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();

                let importedScheduleItems: ScheduleItem[] = [];
                for (let i = 0; i < result.length; i++) {
                    const row = result[i];

                    importedScheduleItems.push({
                        id: row.id,
                        dateString: row.dateString,
                        time: row.time,
                        game: row.game,
                        description: row.description
                    })
                }

                setSchedules(importedScheduleItems);

                console.log('Schedule imported successfully! Resulting \`ScheduleItems\`:', importedScheduleItems);
                setOperationStatus(`${importedScheduleItems.length} schedule items imported from CrispyDB!`);
            } else {
                const errorData = await response.text();
                console.error('Failed to import schedule:', errorData);
                setOperationStatus('Failed to import schedule from CrispyDB. Please try again.');
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setOperationStatus('An error occurred while importing the schedule from CrispyDB.');
        }
    }

    return (
        <div className="flex font-sans justify-center md:px-16 md:pt-20 pb-20 overflow-y-auto min-h-screen relative max-w-full bg-neutral-900/50 dark">
            <SEOHeader title="Crispy's Stream Scheduler" />
            <Background />
            <Header />

            <div className="p-2 md:p-4 max-w-full flex flex-col items-center gap-4 bg-white/75 dark:bg-transparent backdrop-blur-lg backdrop-brightness-50 text-neutral-900 dark:text-slate-50 md:rounded-lg shadow-md relative">
                <h1 className='text-2xl md:text-3xl font-semibold'>Crispy's Stream Scheduler</h1>
                <div className='w-full flex justify-center items-center gap-4 flex-col md:flex-row'>
                    <form onSubmit={addSchedule} className="flex flex-col space-y-4 justify-center w-full grow md:min-w-80 md:max-w-96">
                        <h2 className='text-xl font-semibold'>Add to Schedule</h2>
                        <div className='flex gap-2 !mt-2'>
                            <input
                                type="date"
                                value={dateString}
                                onChange={(e) => {
                                    setDateString(e.target.value)
                                }}
                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => { setTime(e.target.value) }}
                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                            />
                        </div>
                        <input
                            type="text"
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                            placeholder="Game name"
                            required
                            className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="(optional) Description"
                            className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                        />
                        <button
                            type="submit"
                            className="btn-secondary"
                        >
                            <PlusCircleIcon className='w-5 h-5' />
                            <span>Add</span>
                        </button>
                    </form>

                    <div className='flex flex-col gap-2 bg-neutral-800/30 dark:bg-neutral-800/80 p-4 rounded-lg'>
                        <canvas ref={canvasRef} id="scheduleCanvas" className="w-full h-auto aspect-square min-w-64 max-w-[768px] min-h-96 max-h-[50vh]"></canvas>

                        <button
                            onClick={saveCanvasAsImage}
                            className="btn-primary"
                        >
                            <ArrowDownTrayIcon className='w-5 h-5' />
                            <span>Save as PNG</span>
                        </button>
                    </div>
                </div>


                <table className="border-collapse w-full overflow-x-auto table-fixed rounded-md">
                    <thead className='text-sm md:text-base rounded-t-md'>
                        <tr className='rounded-t-md bg-gray-100 dark:bg-gray-800'>
                            <th className={`px-2 py-1 md:px-4 md:py-2 ${editingScheduleId ? 'w-28 md:w-40 text-xs md:text-base' : 'w-12 md:w-32'}`}>Day</th>
                            <th className={`px-2 py-1 md:px-4 md:py-2 ${editingScheduleId ? 'w-24 md:w-40 text-xs md:text-base' : 'w-16 md:w-24'}`}>Time</th>
                            <th className="px-2 py-1 md:px-4 md:py-2">Game</th>
                            <th className="px-2 py-1 md:px-4 md:py-2">Description</th>
                            <th className="px-2 py-1 md:px-4 md:py-2 w-12 md:w-16"></th>
                        </tr>
                    </thead>
                    <tbody className='text-sm md:text-base'>
                        {sortSchedules(schedules).map((schedule) => (
                            <tr key={schedule.id} className='even:bg-gray-100 odd:bg-gray-200 even:dark:bg-gray-800 odd:dark:bg-gray-900 text-black dark:text-white'>
                                {editingScheduleId === schedule.id ? (
                                    <>
                                        <td className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base">
                                            <input
                                                type="date"
                                                value={editedDateString}
                                                onChange={(e) => setEditedDateString(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                                ref={dateStringInputRef}
                                            />
                                        </td>
                                        <td className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base">
                                            <input
                                                type="time"
                                                value={editedTime}
                                                onChange={(e) => setEditedTime(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                                ref={timeInputRef}
                                            />
                                        </td>
                                        <td className="px-2 py-1 md:px-4 md:py-2">
                                            <input
                                                type="text"
                                                value={editedGame}
                                                onChange={(e) => setEditedGame(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                required
                                                placeholder="Enter game name"
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                                ref={gameInputRef}
                                            />
                                        </td>
                                        <td className="px-2 py-1 md:px-4 md:py-2">
                                            <input
                                                type="text"
                                                value={editedDescription}
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                placeholder="(optional) Enter description"
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                                ref={descriptionInputRef}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-2 py-1 md:px-4 md:py-2 text-center relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => dateStringInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>    {(() => {
                                                const [year, month, day] = schedule.dateString.split("-");
                                                // Note that the month is 0-based in JavaScript Date objects (0=January, 11=December)
                                                const date = new Date(Number(year), Number(month) - 1, Number(day));
                                                return date.toLocaleString('en-ca', { 'weekday': 'short', 'month': 'short', 'day': '2-digit' });
                                            })()}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' />
                                        </td>
                                        <td className="px-2 py-1 md:px-4 md:py-2 text-center relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => timeInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.time ? formatScheduleTableTimeString(schedule.time) : <span className='italic opacity-30'>none</span>}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                        <td className="px-2 py-1 md:px-4 md:py-2 relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => gameInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.game}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                        <td className="px-2 py-1 md:px-4 md:py-2 break-all relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => descriptionInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.description ? schedule.description : <span className='italic opacity-30'>none</span>}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                    </>
                                )}
                                <td className="px-2 py-2">
                                    {editingScheduleId === schedule.id ? (
                                        <button
                                            onClick={() => saveScheduleChanges(schedule.id)}
                                            className="btn-action-green"
                                        >
                                            <CheckIcon className='w-5 h-5 md:w-6 md:h-6' />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => removeSchedule(schedule.id)}
                                            disabled={!isAuthorized}
                                            className="btn-action-red"
                                        >
                                            <TrashIcon className='w-5 h-5 md:w-6 md:h-6' />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='flex flex-row flex-wrap gap-x-8 gap-y-8 w-full md:justify-center grow'>
                    <form className='flex flex-col w-full max-w-96 grow-0 shrink'
                        onSubmit={authorizeCrispyDB}>
                        <h2 className='font-semibold text-lg mb-0.5'>CrispyDB Auth</h2>
                        <h3 className='text-sm mb-2'>Enables remote update, import, and deletion.</h3>
                        <input
                            ref={passwordInputRef}
                            disabled={isAuthorized}
                            type="password"
                            placeholder="Password"
                            required={true}
                            defaultValue={localStorage.getItem('crispyDBPassword') || ''}
                            className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 disabled:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 disabled:dark:bg-gray-500 dark:bg-gray-800 disabled:text-white/50 text-black dark:text-white mb-2"
                        />
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-1.5 text-sm w-full'>
                                <input
                                    className='w-5 h-5'
                                    id="rememberMeCheckbox"
                                    type="checkbox"
                                    disabled={isAuthorized}
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMeCheckbox">Remember Password</label>
                            </div>
                            <button
                                type="submit"
                                disabled={isAuthorized}
                                onClick={authorizeCrispyDB}
                                className="btn-primary"
                            >
                                {isAuthorized ? <LockOpenIcon className='w-5 h-5' /> : <LockClosedIcon className='w-5 h-5' />}
                                <span>{isAuthorized ? "Authorized!" : "Authorize"}</span>
                            </button>
                        </div>
                    </form>
                    <div className='flex flex-col w-full max-w-96 grow-0 shrink'>
                        <h2 className='font-semibold text-lg mb-0.5'>CrispyDB Operations</h2>
                        <div className='flex gap-2 mb-1'>
                            <div className='w-full flex flex-col gap-1'>
                                <p className='text-center text-xs italic my-1 py-0.5'>Does not yet affect Twitch schedule</p>
                                <button
                                    onClick={updateCrispyDBSchedule}
                                    disabled={!isAuthorized}
                                    className="btn-primary"
                                >
                                    {isAuthorized ? <CloudArrowUpIcon className='w-5 h-5' /> : <LockClosedIcon className='w-5 h-5' />}
                                    <span>Update</span>
                                </button>
                            </div>
                            <div className='w-full flex flex-col gap-1'>
                                <div className='flex items-center gap-1 mx-auto'>
                                    <input
                                        type="date"
                                        value={scheduleImportStartDate}
                                        onChange={(e) => {
                                            setScheduleImportStartDate(e.target.value)
                                        }}
                                        className="text-xs block max-w-80 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                    />
                                    <span className='whitespace-nowrap text-xs'>- {sevenDaysLaterDate}</span>
                                </div>
                                <button
                                    onClick={importScheduleFromCrispyDB}
                                    disabled={!isAuthorized}
                                    className="btn-secondary"
                                >
                                    {isAuthorized ? <CloudArrowDownIcon className='w-5 h-5' /> : <LockClosedIcon className='w-5 h-5' />}
                                    <span>Import</span>
                                </button>
                            </div>
                        </div>
                        <p className='text-center italic font-mono'>{operationStatus}</p>
                    </div>

                    <div className='flex flex-col w-full max-w-96 grow'>
                        <h2 className='font-semibold text-lg !mb-0.5'>Schedule JSON</h2>
                        <textarea
                            ref={importJsonTextareaRef}
                            className="w-full p-2 min-h-32 border border-gray-300 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-md shadow-sm text-xs font-mono grow mb-2"
                            placeholder="Paste your schedule JSON here..."
                        ></textarea>

                        <button
                            onClick={importScheduleFromJSON}
                            className="btn-secondary"
                        >
                            <CodeBracketIcon className='w-5 h-5' />
                            <span>Import Schedule from JSON</span>
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Scheduler;
