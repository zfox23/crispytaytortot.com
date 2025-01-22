import React, { useState } from 'react';
import { fetchGameIcon } from './SchedulerTable';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { ScheduleItem } from '../../../shared/src/types';

export const SchedulerAdder = ({ schedules, setSchedules }: { schedules: ScheduleItem[], setSchedules: (i: ScheduleItem[]) => void }) => {
    const [startDateTimeRFC3339, setStartDateTimeRFC3339] = useState('');
    const [endDateTimeRFC3339, setEndDateTimeRFC3339] = useState('');
    const [game, setGame] = useState('');
    const [description, setDescription] = useState('');

    const addSchedule = async (event: React.FormEvent) => {
        event.preventDefault();
        const iconUrl = await fetchGameIcon(game);
        if (startDateTimeRFC3339 && endDateTimeRFC3339 && game) {
            setSchedules([...schedules, {
                id: crypto.randomUUID(),
                startDateTimeRFC3339,
                endDateTimeRFC3339,
                ianaTimeZoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
                game,
                description,
                iconUrl
            }]);
            setStartDateTimeRFC3339('');
            setEndDateTimeRFC3339('');
            setGame('');
            setDescription('');
        }
    };

    return (
        <form onSubmit={addSchedule} className="flex flex-col space-y-4 justify-center w-full grow md:min-w-80 md:max-w-96">
            <h2 className='text-xl font-semibold'>Add to Schedule</h2>
            <div className='flex flex-col items-center gap-1 !mt-2'>
                <div className='w-full'>
                    <p>Start</p>
                    <input
                        type="datetime-local"
                        value={startDateTimeRFC3339}
                        onChange={(e) => {
                            setStartDateTimeRFC3339(e.target.value)
                        }}
                        className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
                <div className='w-full'>
                    <p>End</p>
                    <input
                        type="datetime-local"
                        value={endDateTimeRFC3339}
                        onChange={(e) => { setEndDateTimeRFC3339(e.target.value) }}
                        className="block w-full px-1.5 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    />
                </div>
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