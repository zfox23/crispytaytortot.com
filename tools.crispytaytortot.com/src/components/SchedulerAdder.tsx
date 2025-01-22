import React, { useEffect, useRef, useState } from 'react';
import { fetchGameIcon } from './SchedulerTable';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { ScheduleItem } from '../../../shared/src/types';
import { computeDurationInHours, SCHEDULED_STREAM_LIMIT_HOURS } from '../../../shared/src/shared';

export const SchedulerAdder = ({ schedules, setSchedules }: { schedules: ScheduleItem[], setSchedules: (i: ScheduleItem[]) => void }) => {
    const [startDateTimeString, setStartDateTimeString] = useState('');
    const [endDateTimeString, setEndDateTimeString] = useState('');
    const [game, setGame] = useState('');
    const [description, setDescription] = useState('');

    const endDateTimeInputRef = useRef<HTMLInputElement>(null);

    const checkStreamDuration = () => {
        if (!(endDateTimeInputRef && endDateTimeInputRef.current)) return;

        if (computeDurationInHours(startDateTimeString, endDateTimeString) > SCHEDULED_STREAM_LIMIT_HOURS) {
            endDateTimeInputRef.current.setCustomValidity(`Maximum stream duration is ${SCHEDULED_STREAM_LIMIT_HOURS} hours.`);
        } else {
            endDateTimeInputRef.current.setCustomValidity("");
        }
    }

    useEffect(checkStreamDuration, [endDateTimeString]);

    const addSchedule = async (event: React.FormEvent) => {
        event.preventDefault();

        checkStreamDuration();

        const iconUrl = await fetchGameIcon(game);
        if (startDateTimeString && endDateTimeString && game) {
            setSchedules([...schedules, {
                id: crypto.randomUUID(),
                startDateTimeRFC3339: new Date(startDateTimeString).toISOString(),
                endDateTimeRFC3339: new Date(endDateTimeString).toISOString(),
                ianaTimeZoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
                game,
                description,
                iconUrl
            }]);
            setStartDateTimeString('');
            setEndDateTimeString('');
            setGame('');
            setDescription('');
        }
    };

    return (
        <form onSubmit={addSchedule} className="flex flex-col space-y-4 justify-center w-full grow md:min-w-80 md:max-w-96">
            <h2 className='text-xl font-semibold'>Add to Schedule</h2>
            <div className='flex flex-col items-start gap-0.5'>
                <div className='w-full'>
                    <input
                        type="datetime-local"
                        value={startDateTimeString}
                        required={true}
                        onChange={(e) => {
                            setStartDateTimeString(e.target.value);
                            if (!endDateTimeString) {
                                setEndDateTimeString(e.target.value);
                            }
                        }}
                        className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
                <p>to</p>
                <div className='w-full'>
                    <input
                        type="datetime-local"
                        value={endDateTimeString}
                        required={true}
                        ref={endDateTimeInputRef}
                        onChange={(e) => {
                            setEndDateTimeString(e.target.value);
                        }}
                        className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
                <p className='italic text-sm'>Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
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
    )
}