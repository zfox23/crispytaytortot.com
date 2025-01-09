import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon, CloudArrowDownIcon, CloudArrowUpIcon, CodeBracketIcon, LockClosedIcon, LockOpenIcon, PaintBrushIcon, PlusCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import SEOHeader from '../components/SEOHeader';
import { Footer } from '../../../crispytaytortot.com/src/components/Footer';
import { Background } from '../../../crispytaytortot.com/src/components/Background';
import { AuthorizePayload, DeleteScheduleItemPayload, GetSchedulePayload, ScheduleItem, SetSchedulePayload } from '../../../shared/src/types';
import { Header } from '../components/Header';
import { GAME_ICON_HEIGHT_PX, GAME_ICON_WIDTH_PX, SchedulerCanvas } from '../components/SchedulerCanvas';

const isBrowser = typeof window !== "undefined";

const Scheduler: React.FC = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [rememberMe, setRememberMe] = useState(isBrowser && !!localStorage.getItem('crispyDBPassword'));
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [sortedSchedules, setSortedSchedules] = useState<ScheduleItem[]>([]);
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
    const [editedIconUrl, setEditedIconUrl] = useState('');
    const [operationStatus, setOperationStatus] = useState('');

    const dateStringInputRef = useRef<HTMLInputElement | null>(null);
    const timeInputRef = useRef<HTMLInputElement | null>(null);
    const gameIconInputRef = useRef<HTMLInputElement | null>(null);
    const gameInputRef = useRef<HTMLInputElement | null>(null);
    const descriptionInputRef = useRef<HTMLInputElement | null>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
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
        if (!(isBrowser && passwordInputRef.current)) return;

        const storedPassword = localStorage.getItem('crispyDBPassword');
        if (storedPassword) {
            passwordInputRef.current.value = storedPassword;
        }

        authorizeCrispyDB();
    }, []);

    const handleGameIconUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                // Create an image element to load the uploaded file
                const img = new Image();
                img.src = reader.result as string;

                img.onload = () => {
                    // Create a canvas element to draw the resized image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        console.error("Couldn't scale game icon down. No change.")
                        return;
                    }

                    // Set the canvas dimensions to 64x64
                    canvas.width = GAME_ICON_WIDTH_PX;
                    canvas.height = GAME_ICON_HEIGHT_PX;

                    // Draw the image on the canvas, scaling it down
                    ctx.drawImage(img, 0, 0, GAME_ICON_WIDTH_PX, GAME_ICON_HEIGHT_PX);

                    // Convert the resized canvas content to a base64 string
                    const base64String = canvas.toDataURL('image/webp', 0.7);
                    setEditedIconUrl(base64String);
                };
            };

            reader.readAsDataURL(file);
        }
    }

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
        setSortedSchedules(sortSchedules(schedules));
        saveScheduleAsJSON();
    }, [schedules]);

    const addSchedule = async (event: React.FormEvent) => {
        event.preventDefault();
        const iconUrl = await fetchGameIcon(game);
        if (dateString && game) {
            setSchedules([...schedules, { id: crypto.randomUUID(), dateString, time, game, description, iconUrl }]);
            setDateString('');
            setTime('');
            setGame('');
            setDescription('');
            setEditedIconUrl('');
        }
    };

    const editSchedule = async (id: string) => {
        const scheduleToEdit = schedules.find((schedule) => schedule.id === id);
        if (!scheduleToEdit) return;

        let i = scheduleToEdit.iconUrl || await fetchGameIcon(scheduleToEdit.game);

        setEditingScheduleId(id);
        setEditedDateString(scheduleToEdit.dateString);
        setEditedTime(scheduleToEdit.time || "");
        setEditedGame(scheduleToEdit.game);
        setEditedDescription(scheduleToEdit.description || "");
        setEditedIconUrl(i);
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
                        description: editedDescription,
                        iconUrl: editedIconUrl
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

    const fetchGameIcon = async (gameName: string): Promise<string> => {
        if (!gameName) {
            return "/images/crispytaytortot-70x70.png";
        }

        try {
            // Fetch game details from the proxy server
            const response = await fetch(`/api/v1/steam/search-game?gameName=${encodeURIComponent(gameName)}`);
            let responseJSON = await response.json();

            if (!(responseJSON && responseJSON.iconUrl)) {
                return "/images/crispytaytortot-70x70.png";
            }

            return responseJSON;
        } catch (error) {
            console.error('Error fetching game details:', error);
            return "/images/crispytaytortot-70x70.png";
        }
    };

    const formatScheduleTableTimeString = (timeValue) => {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12) || 12; // Convert to 12-hour format
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

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

                if (isBrowser && rememberMe) {
                    localStorage.setItem('crispyDBPassword', password);
                } else if (isBrowser) {
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


                    let ico = row.iconUrl || await fetchGameIcon(row.game);

                    importedScheduleItems.push({
                        id: row.id,
                        dateString: row.dateString,
                        time: row.time,
                        game: row.game,
                        description: row.description,
                        iconUrl: ico
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

                    <SchedulerCanvas sortedSchedules={sortedSchedules} />
                </div>


                <table className="border-collapse w-full overflow-x-auto table-fixed rounded-md">
                    <thead className='text-sm md:text-base rounded-t-md'>
                        <tr className='rounded-t-md bg-gray-100 dark:bg-gray-800'>
                            <th className={`px-2 py-1 md:px-4 md:py-2 ${editingScheduleId ? 'w-28 md:w-40 text-xs md:text-base' : 'w-12 md:w-32'}`}>Day</th>
                            <th className={`px-2 py-1 md:px-4 md:py-2 ${editingScheduleId ? 'w-24 md:w-40 text-xs md:text-base' : 'w-16 md:w-24'}`}>Time</th>
                            <th className="px-2 py-1 md:px-4 md:py-2 w-20">Icon</th>
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
                                            <img className='w-10 h-10 object-cover cursor-pointer' onClick={() => (document.querySelector("#iconImageUpload") as HTMLInputElement)?.click()} src={editedIconUrl} />
                                            <input
                                                type="file"
                                                id="iconImageUpload"
                                                accept="image/*"
                                                onChange={handleGameIconUpload}
                                                className="hidden cursor-pointer mt-1 w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                                ref={gameIconInputRef}
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
                                        <td className="px-2 py-1 md:px-4 md:py-2 relative group cursor-pointer flex items-center justify-center" onClick={() => {
                                            editSchedule(schedule.id);
                                            setTimeout(() => {
                                                (document.querySelector("#iconImageUpload") as HTMLInputElement)?.click();
                                            }, 0);
                                        }}>
                                            <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                                                <img className='w-10 h-10 aspect-square object-cover' src={schedule.iconUrl} />
                                            </button>
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
                                <td className="px-2 py-1">
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
                            defaultValue={isBrowser && localStorage.getItem('crispyDBPassword') || ''}
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
