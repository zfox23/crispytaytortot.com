import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon, CloudArrowDownIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import SEOHeader from '../components/SEOHeader';
import { Footer } from '../../../../crispytaytortot.com/website/src/components/Footer';
import { Background } from '../../../../crispytaytortot.com/website/src/components/Background';

interface ScheduleItem {
    id: string;
    day: string;
    time?: string;
    game: string;
    description?: string;
    appId?: number; // Add appId to store the Steam App ID
    iconUrl?: string; // Store the icon URL
}

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
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [scheduleStartDate, setScheduleStartDate] = useState('');
    const [day, setDay] = useState('');
    const [time, setTime] = useState('');
    const [game, setGame] = useState('');
    const [description, setDescription] = useState('');
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
    const [editedDay, setEditedDay] = useState('');
    const [editedTime, setEditedTime] = useState('');
    const [editedGame, setEditedGame] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    const dayInputRef = useRef<HTMLSelectElement | null>(null);
    const timeInputRef = useRef<HTMLInputElement | null>(null);
    const gameInputRef = useRef<HTMLInputElement | null>(null);
    const descriptionInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const importJsonTextareaRef = useRef<HTMLTextAreaElement>(null);

    const getNextMonday = () => {
        // Get today's date
        const today = new Date();

        // Calculate the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
        const currentDayOfWeek = today.getDay();

        // Calculate how many days to add to get to the next Monday
        // If today is Monday (1), we need to add 6 days to get to the next Monday
        // If today is Sunday (0), we need to add 1 day to get to the next Monday
        const daysUntilNextMonday = (8 - currentDayOfWeek) % 7;

        // Create a new date for the next Monday
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilNextMonday);

        // Format the date in YYYY-MM-DD format
        const year = nextMonday.getFullYear();
        const month = String(nextMonday.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(nextMonday.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        const nextMonday = getNextMonday();
        setScheduleStartDate(nextMonday);
    }, [])

    useEffect(() => {
        if (!scheduleStartDate) return;
        renderSchedule();
        saveScheduleAsJSON();
    }, [scheduleStartDate, schedules]);

    const addSchedule = (event: React.FormEvent) => {
        event.preventDefault();
        if (day && game) {
            setSchedules([...schedules, { id: crypto.randomUUID(), day, time, game, description }]);
            setDay('');
            setTime('');
            setGame('');
            setDescription('');
        }
    };

    const editSchedule = (id: string) => {
        const scheduleToEdit = schedules.find((schedule) => schedule.id === id);
        if (!scheduleToEdit) return;

        setEditingScheduleId(id);
        setEditedDay(scheduleToEdit.day);
        setEditedTime(scheduleToEdit.time || "");
        setEditedGame(scheduleToEdit.game);
        setEditedDescription(scheduleToEdit.description || "");
    };

    const removeSchedule = (id: string) => {
        setSchedules(schedules.filter((schedule) => schedule.id !== id));
    };

    const saveScheduleChanges = (id: string) => {
        setSchedules((prevSchedules) =>
            prevSchedules.map((schedule) =>
                schedule.id === id
                    ? {
                        ...schedule,
                        day: editedDay,
                        time: editedTime,
                        game: editedGame,
                        description: editedDescription
                    }
                    : schedule
            )
        );
        setEditingScheduleId(null);
    };

    const sortSchedules = (inputSchedules) => {
        const sortedSchedules = [...inputSchedules].sort((a, b) => {
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            if (days.indexOf(a.day) === days.indexOf(b.day)) {
                if (a.time && !b.time) {
                    return 1;
                } else if (!a.time && b.time) {
                    return -1;
                } else if (a.time && b.time) {
                    return a.time.localeCompare(b.time);
                }
            }
            return days.indexOf(a.day) - days.indexOf(b.day);
        });

        return sortedSchedules;
    }

    const fetchAppIdAndIcon = async (gameName: string): Promise<{ appId?: number; iconUrl?: string }> => {
        if (!gameName) {
            return { iconUrl: "/crispytaytortot-70x70.png" };
        }

        try {
            // Fetch game details from the proxy server
            const response = await fetch(`/api/v1/steam/search-game?gameName=${encodeURIComponent(gameName)}`);
            let responseJSON = await response.json();

            if (!(responseJSON && responseJSON.iconUrl)) {
                return { iconUrl: "/crispytaytortot-70x70.png" };
            }

            return responseJSON;
        } catch (error) {
            console.error('Error fetching game details:', error);
            return { iconUrl: "/crispytaytortot-70x70.png" };
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

    const formatTimeString = (timeValue) => {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const now = new Date();
        const inputDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Format local time
        const centralTime = inputDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: "short", hour12: true });
        const utcTime = inputDate.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric', timeZoneName: "short", hour12: false });

        return `${centralTime} / ${utcTime}`;
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

        const [year, month, date] = scheduleStartDate.split('-').map(Number);
        const startDate = new Date(year, month - 1, date);
        const endDate = new Date(year, month - 1, date + 6);

        text = formatDateRange(startDate, endDate);
        textX = canvas.width / 2;
        ctx.textAlign = "center";
        ctx.fillText(text, textX, textY);

        ctx.textAlign = "start";

        textY += 32;

        let currentDay: string = "";

        for (let i = 0; i < sortedSchedules.length; i++) {
            let numCurrentDays;
            textX = 32;
            if (currentDay !== sortedSchedules[i].day) {
                currentDay = sortedSchedules[i].day;
                numCurrentDays = sortedSchedules.filter((s) => { return s.day === currentDay; }).length;

                ctx.fillStyle = "#000000AA";
                ctx.beginPath();
                ctx.roundRect(textX, textY, canvas.width - (2 * textX), DAY_RECT_BG_BASE_HEIGHT_PX + ((numCurrentDays - 1) * 82), DAY_RECT_BG_RADII_PX);
                ctx.fill();

                ctx.font = `${WEEKDAY_TEXT_HEIGHT_PX}px tilt-neon`;
                textX += DAY_RECT_BG_RADII_PX / 2;
                textY += DAY_RECT_BG_BASE_HEIGHT_PX / 2 + 15;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(sortedSchedules[i].day.toUpperCase(), textX, textY);
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
                text = formatTimeString(sortedSchedules[i].time);
                ctx.fillText(text, textX, textY);
                textY += DETAILS_TEXT_HEIGHT_PX + 2;
                text = `${sortedSchedules[i].game} - ${sortedSchedules[i].description}`;
                ctx.fillText(text, textX, textY);
            } else if (sortedSchedules[i].time && sortedSchedules[i].game && !sortedSchedules[i].description) {
                textY -= (DETAILS_TEXT_HEIGHT_PX - 13);
                text = formatTimeString(sortedSchedules[i].time);
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

            if (sortedSchedules[i + 1] && currentDay !== sortedSchedules[i + 1].day) {
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
            scheduleStartDate: scheduleStartDate,
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
                setScheduleStartDate(new Date().toISOString().split('T')[0]); // Reset to today's date
                return;
            }

            const importedData = JSON.parse(jsonContent);

            // Extract scheduleStartDate and schedules from the parsed data
            if (importedData.scheduleStartDate) {
                setScheduleStartDate(importedData.scheduleStartDate);
            } else {
                setScheduleStartDate(new Date().toISOString().split('T')[0]); // Default to today's date if not provided
            }

            if (Array.isArray(importedData.schedules)) {
                setSchedules(importedData.schedules);
            } else {
                setSchedules([]); // Reset schedules if invalid or not provided
            }
        } catch (error) {
            alert('Invalid JSON format. Please check your input and try again.');
        }

    };

    return (
        <div className="flex font-sans justify-center p-2 md:p-16 pb-20 overflow-y-auto min-h-screen relative max-w-full bg-neutral-900/50">
            <SEOHeader title="Crispy's Stream Scheduler" />
            <Background />

            <Footer />

            <div className="p-2 md:p-4 max-w-full flex flex-col items-center gap-4 bg-white rounded-lg shadow-md relative">
                <div className='w-full flex justify-center gap-4 flex-col md:flex-row'>
                    <div className='overflow-auto flex flex-col justify-start items-center gap-4 grow w-full'>
                        <div className='flex flex-col items-center gap-2'>
                            <h1 className='text-2xl md:text-3xl font-semibold'>Crispy's Stream Scheduler</h1>
                            <div className='flex items-center gap-2'>
                                <span className='whitespace-nowrap text-xl'>Week of: </span>
                                <input
                                    type="date"
                                    value={scheduleStartDate}
                                    onChange={(e) => {
                                        setScheduleStartDate(e.target.value)
                                    }}
                                    className="text-xl block w-full max-w-80 px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <form onSubmit={addSchedule} className="flex flex-col space-y-4 grow justify-center w-full md:max-w-96">
                            <h2 className='text-center text-xl'>Add to Schedule</h2>
                            <div className='flex gap-2 !mt-2'>
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    required
                                    className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Day of Week</option>
                                    <option value="Mon">Monday</option>
                                    <option value="Tue">Tuesday</option>
                                    <option value="Wed">Wednesday</option>
                                    <option value="Thu">Thursday</option>
                                    <option value="Fri">Friday</option>
                                    <option value="Sat">Saturday</option>
                                    <option value="Sun">Sunday</option>
                                </select>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => { setTime(e.target.value) }}
                                    className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <input
                                type="text"
                                value={game}
                                onChange={(e) => setGame(e.target.value)}
                                placeholder="Game name"
                                required
                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                            />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="(optional) Description"
                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                            />
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center items-center gap-1 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            >
                                <PlusCircleIcon className='w-5 h-5' />
                                <span>Add</span>
                            </button>
                        </form>
                    </div>

                    <div className='grow shrink min-w-64 max-w-[768px] flex flex-col gap-2 bg-neutral-800/30 p-4 rounded-lg'>
                        <canvas ref={canvasRef} id="scheduleCanvas" className="w-full h-auto"></canvas>

                        <button
                            onClick={saveCanvasAsImage}
                            className="w-full inline-flex justify-center items-center gap-1 py-2 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            <ArrowDownTrayIcon className='w-5 h-5' />
                            <span>Save as PNG</span>
                        </button>
                    </div>
                </div>


                <table className="border-collapse w-full overflow-x-auto table-fixed">
                    <thead className='text-sm md:text-base'>
                        <tr>
                            <th className={`px-2 py-1 md:px-4 md:py-2 bg-gray-100 ${editingScheduleId ? 'w-28 md:w-48 text-xs md:text-base' : 'w-12 md:w-16'}`}>Day</th>
                            <th className={`px-2 py-1 md:px-4 md:py-2 bg-gray-100 ${editingScheduleId ? 'w-24 md:w-40 text-xs md:text-base' : 'w-16 md:w-20'}`}>Time</th>
                            <th className="px-2 py-1 md:px-4 md:py-2 bg-gray-100">Game</th>
                            <th className="px-2 py-1 md:px-4 md:py-2 bg-gray-100">Description</th>
                            <th className="px-2 py-1 md:px-4 md:py-2 bg-gray-100 w-12 md:w-16"></th>
                        </tr>
                    </thead>
                    <tbody className='text-sm md:text-base'>
                        {sortSchedules(schedules).map((schedule) => (
                            <tr key={schedule.id}>
                                {editingScheduleId === schedule.id ? (
                                    <>
                                        <td className="border px-2 py-1 md:px-4 md:py-2 text-xs md:text-base">
                                            <select
                                                value={editedDay}
                                                onChange={(e) => setEditedDay(e.target.value)}
                                                required
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                ref={dayInputRef}
                                            >
                                                <option value="">Day of Week</option>
                                                <option value="Mon">Monday</option>
                                                <option value="Tue">Tuesday</option>
                                                <option value="Wed">Wednesday</option>
                                                <option value="Thu">Thursday</option>
                                                <option value="Fri">Friday</option>
                                                <option value="Sat">Saturday</option>
                                                <option value="Sun">Sunday</option>
                                            </select>
                                        </td>
                                        <td className="border px-2 py-1 md:px-4 md:py-2 text-xs md:text-base">
                                            <input
                                                type="time"
                                                value={editedTime}
                                                onChange={(e) => setEditedTime(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault(); // Prevent any default behavior like form submission
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                ref={timeInputRef}
                                            />
                                        </td>
                                        <td className="border px-2 py-1 md:px-4 md:py-2">
                                            <input
                                                type="text"
                                                value={editedGame}
                                                onChange={(e) => setEditedGame(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault(); // Prevent any default behavior like form submission
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                required
                                                placeholder="Enter game name"
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                ref={gameInputRef}
                                            />
                                        </td>
                                        <td className="border px-2 py-1 md:px-4 md:py-2">
                                            <input
                                                type="text"
                                                value={editedDescription}
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault(); // Prevent any default behavior like form submission
                                                        saveScheduleChanges(schedule.id);
                                                    }
                                                }}
                                                placeholder="(optional) Enter description"
                                                className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                ref={descriptionInputRef}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border px-2 py-1 md:px-4 md:py-2 text-center relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => dayInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.day}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' />
                                        </td>
                                        <td className="border px-2 py-1 md:px-4 md:py-2 text-center relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => timeInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.time ? schedule.time : <span className='italic opacity-30'>none</span>}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                        <td className="border px-2 py-1 md:px-4 md:py-2 relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => gameInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.game}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                        <td className="border px-2 py-1 md:px-4 md:py-2 break-all relative group cursor-pointer" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => descriptionInputRef.current?.focus(), 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.description ? schedule.description : <span className='italic opacity-30'>none</span>}</button>
                                            <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                    </>
                                )}
                                <td className="border px-2 py-2">
                                    {editingScheduleId === schedule.id ? (
                                        <button
                                            onClick={() => saveScheduleChanges(schedule.id)}
                                            className="inline-flex justify-center py-1 px-1.5 md:py-2 md:px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <CheckIcon className='w-5 h-5 md:w-6 md:h-6' />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => removeSchedule(schedule.id)}
                                            className="inline-flex justify-center py-1 px-1.5 md:py-2 md:px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <TrashIcon className='w-5 h-5 md:w-6 md:h-6' />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='flex flex-col gap-2 w-full md:max-w-96 grow'>
                    <textarea
                        ref={importJsonTextareaRef}
                        className="w-full p-2 min-h-32 border border-gray-300 rounded-md shadow-sm text-xs font-mono grow"
                        placeholder="Paste your schedule JSON here..."
                    ></textarea>

                    <button
                        onClick={importScheduleFromJSON}
                        className="w-full inline-flex justify-center items-center gap-0.5 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                        <CloudArrowDownIcon className='w-5 h-5' />
                        <span>Import Schedule from JSON</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
