import React, { useEffect, useRef, useState } from 'react';
import { PencilIcon } from "@heroicons/react/24/outline";
import { GAME_ICON_HEIGHT_PX, GAME_ICON_WIDTH_PX } from './SchedulerCanvas';
import { ScheduleRouterPostDeletePayload, ScheduleItem } from '../../../shared/src/types';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/solid';
import { rfc3339ToLocalYYYYMMDDTHHMM } from '../../../shared/src/shared';
import { LoadingSpinner } from './LoadingSpinner';

export const isBrowser = typeof window !== "undefined";

export const fetchGameIcon = async (gameName: string): Promise<string> => {
    if (!(gameName && isBrowser)) {
        return "/images/crispytaytortot-70x70.png";
    }

    try {
        // Fetch game details from the proxy server
        const response = await fetch(`/api/v2/steam/search-game?gameName=${encodeURIComponent(gameName)}`);
        let responseJSON = await response.json();

        if (!(responseJSON && responseJSON.iconUrl)) {
            return "/images/crispytaytortot-70x70.png";
        }

        return responseJSON.iconUrl;
    } catch (error) {
        console.error('Error fetching game details:', error);
        return "/images/crispytaytortot-70x70.png";
    }
};

export const SchedulerTable = ({ sortedSchedules, setSchedules, passwordInputRef, isAuthorized, setOperationStatus }) => {
    const [isPerformingTwitchAPIOperation, setIsPerformingTwitchAPIOperation] = useState<string>('');
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
    const [editedStartDateTimeString, setEditedStartDateTimeString] = useState('');
    const [editedEndDateTimeString, setEditedEndDateTimeString] = useState('');
    const [editedGame, setEditedGame] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedIconUrl, setEditedIconUrl] = useState('');

    const editingStartDateTimeInputRef = useRef<HTMLInputElement | null>(null);
    const editingEndDateTimeInputRef = useRef<HTMLInputElement | null>(null);
    const editingGameIconInputRef = useRef<HTMLInputElement | null>(null);
    const editingGameInputRef = useRef<HTMLInputElement | null>(null);
    const editingDescriptionInputRef = useRef<HTMLInputElement | null>(null);

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

    const editSchedule = async (id: string) => {
        const scheduleToEdit: ScheduleItem = sortedSchedules.find((schedule) => schedule.id === id);
        if (!scheduleToEdit) return;

        let i = scheduleToEdit.iconUrl || await fetchGameIcon(scheduleToEdit.game);

        setEditingScheduleId(id);
        setEditedStartDateTimeString(rfc3339ToLocalYYYYMMDDTHHMM(scheduleToEdit.startDateTimeRFC3339, scheduleToEdit.ianaTimeZoneName));
        setEditedEndDateTimeString(rfc3339ToLocalYYYYMMDDTHHMM(scheduleToEdit.endDateTimeRFC3339, scheduleToEdit.ianaTimeZoneName));
        setEditedGame(scheduleToEdit.game);
        setEditedDescription(scheduleToEdit.description || "");
        setEditedIconUrl(i);
    };

    const removeSchedule = async (id: string) => {
        if (!passwordInputRef.current) {
            return;
        }

        setIsPerformingTwitchAPIOperation(id);

        const password = passwordInputRef.current.value;
        if (!password) {
            setOperationStatus('Password is required.');
            setIsPerformingTwitchAPIOperation('');
            return;
        }


        const payload: ScheduleRouterPostDeletePayload = {
            id,
            password,
        };

        try {
            const response = await fetch('/api/v2/schedule/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Deleted schedule item successfully:', result);
                setSchedules(sortedSchedules.filter((schedule) => schedule.id !== id));
                setOperationStatus("Deleted schedule item from CrispyDB successfully!");
            } else {
                const errorData = await response.text();
                console.error('Failed to delete schedule item:', errorData);
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
        }

        setIsPerformingTwitchAPIOperation('');
    };

    const saveScheduleChanges = (id: string) => {
        setSchedules((prevSchedules) =>
            prevSchedules.map((schedule: ScheduleItem) =>
                schedule.id === id
                    ? {
                        ...schedule,
                        startDateTimeRFC3339: new Date(editedStartDateTimeString).toISOString(),
                        endDateTimeRFC3339: new Date(editedEndDateTimeString).toISOString(),
                        game: editedGame,
                        description: editedDescription,
                        iconUrl: editedIconUrl
                    }
                    : schedule
            )
        );
        setEditingScheduleId(null);
    };

    return (
        <table className="border-collapse w-full overflow-x-auto table-fixed rounded-md">
            <thead className='text-sm md:text-base rounded-t-md'>
                <tr className='rounded-t-md bg-gray-100 dark:bg-gray-800'>
                    <th className={`px-1 py-0.5 md:px-2 md:py-1 ${editingScheduleId ? 'w-36 md:w-48 text-xs md:text-base' : 'w-24 md:w-32'}`}>Start</th>
                    <th className={`px-1 py-0.5 md:px-2 md:py-1 ${editingScheduleId ? 'w-36 md:w-48 text-xs md:text-base' : 'w-24 md:w-32'}`}>End</th>
                    <th className="px-1 py-1 md:px-2 md:py-2 w-10 md:w-16">Icon</th>
                    <th className="px-1 py-0.5 md:px-2 md:py-1">Game</th>
                    <th className="px-1 py-0.5 md:px-2 md:py-1">Broadcast Title</th>
                    <th className="px-1 py-0.5 md:px-2 md:py-1 w-12 md:w-16"></th>
                </tr>
            </thead>
            <tbody className='text-sm md:text-base'>
                {sortedSchedules.map((schedule: ScheduleItem) => (
                    <tr key={schedule.id} className='even:bg-gray-100 odd:bg-gray-200 even:dark:bg-gray-800 odd:dark:bg-gray-900 text-black dark:text-white'>
                        {editingScheduleId === schedule.id ? (
                            <>
                                <td className="px-1 py-0.5 md:px-1 md:py-0.5 text-xs md:text-base">
                                    <input
                                        type="datetime-local"
                                        value={editedStartDateTimeString}
                                        required={true}
                                        onChange={(e) => setEditedStartDateTimeString(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                saveScheduleChanges(schedule.id);
                                            }
                                        }}
                                        className="block w-full px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                        ref={editingStartDateTimeInputRef}
                                    />
                                </td>
                                <td className="px-1 py-0.5 md:px-1 md:py-0.5 text-xs md:text-base">
                                    <input
                                        type="datetime-local"
                                        value={editedEndDateTimeString}
                                        required={true}
                                        onChange={(e) => setEditedEndDateTimeString(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                saveScheduleChanges(schedule.id);
                                            }
                                        }}
                                        className="block w-full px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                        ref={editingEndDateTimeInputRef}
                                    />
                                </td>
                                <td className="px-1 py-0.5 md:px-1 md:py-0.5">
                                    <img className='w-7 md:w-10 h-7 md:h-10 object-cover cursor-pointer mx-auto hover:scale-105 active:scale-100 focus:scale-105 transition-transform duration-75' onClick={() => (document.querySelector("#iconImageUpload") as HTMLInputElement)?.click()} src={editedIconUrl} />
                                    <input
                                        type="file"
                                        id="iconImageUpload"
                                        accept="image/*"
                                        onChange={handleGameIconUpload}
                                        className="hidden cursor-pointer mt-1 w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                        ref={editingGameIconInputRef}
                                    />
                                </td>
                                <td className="px-1 py-0.5 md:px-2 md:py-1">
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
                                        ref={editingGameInputRef}
                                    />
                                </td>
                                <td className="px-1 py-0.5 md:px-2 md:py-1">
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
                                        ref={editingDescriptionInputRef}
                                    />
                                </td>
                            </>
                        ) : (
                            <>
                                <td className="px-1 py-0.5 md:px-2 md:py-1 text-center relative group cursor-pointer" onClick={() => {
                                    editSchedule(schedule.id);
                                    setTimeout(() => editingStartDateTimeInputRef.current?.focus(), 0);
                                }}>
                                    <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>    {(() => {
                                        const date = new Date(schedule.startDateTimeRFC3339);
                                        return date.toLocaleString('en-us', {
                                            'weekday': 'short',
                                            'month': 'short',
                                            'day': '2-digit',
                                            'timeZoneName': 'short',
                                            'hour': '2-digit',
                                            'minute': '2-digit',
                                            'hour12': false
                                        });
                                    })()}</button>
                                    <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' />
                                </td>
                                <td className="px-1 py-0.5 md:px-2 md:py-1 text-center relative group cursor-pointer" onClick={() => {
                                    editSchedule(schedule.id);
                                    setTimeout(() => editingEndDateTimeInputRef.current?.focus(), 0);
                                }}>
                                    <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>    {(() => {
                                        const date = new Date(schedule.endDateTimeRFC3339);
                                        return date.toLocaleString('en-us', {
                                            'weekday': 'short',
                                            'month': 'short',
                                            'day': '2-digit',
                                            'timeZoneName': 'short',
                                            'hour': '2-digit',
                                            'minute': '2-digit',
                                            'hour12': false
                                        });
                                    })()}</button>
                                    <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' />
                                </td>
                                <td className="px-1 py-0.5 md:px-2 md:py-1 relative group cursor-pointer" onClick={() => {
                                    editSchedule(schedule.id);
                                    setTimeout(() => {
                                        (document.querySelector("#iconImageUpload") as HTMLInputElement)?.click();
                                    }, 0);
                                }}>
                                    <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full flex items-center justify-center'>
                                        {schedule.game.toLowerCase() !== "off" ? <img className='w-7 md:w-10 h-7 md:h-10 aspect-square object-cover' src={schedule.iconUrl} /> : null}

                                    </button>
                                    <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' />
                                </td>
                                <td className="px-1 py-0.5 md:px-2 md:py-1 relative group cursor-pointer" onClick={() => {
                                    editSchedule(schedule.id);
                                    setTimeout(() => editingGameInputRef.current?.focus(), 0);
                                }}>
                                    <button className='group-hover:blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>{schedule.game}</button>
                                    <PencilIcon className='w-8 h-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-indigo-700/90 rounded-md p-2 text-white' /></td>
                                <td className="px-1 py-0.5 md:px-2 md:py-1 break-all relative group cursor-pointer" onClick={() => {
                                    editSchedule(schedule.id);
                                    setTimeout(() => editingDescriptionInputRef.current?.focus(), 0);
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
                                    disabled={!isAuthorized || isPerformingTwitchAPIOperation === schedule.id}
                                    className="btn-action-red"
                                >
                                    {isPerformingTwitchAPIOperation === schedule.id ? <LoadingSpinner className='w-5 h-5 md:w-6 md:h-6' /> : <TrashIcon className='w-5 h-5 md:w-6 md:h-6' />}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}