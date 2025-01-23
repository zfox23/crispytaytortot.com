import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { CloudArrowDownIcon, CloudArrowUpIcon, CodeBracketIcon, LockClosedIcon, LockOpenIcon, PaintBrushIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import SEOHeader from '../components/SEOHeader';
import { Footer } from '../../../crispytaytortot.com/src/components/Footer';
import { Background } from '../../../crispytaytortot.com/src/components/Background';
import { ScheduleRouterPostAuthorizePayload, ScheduleRouterPostGetPayload, ScheduleItem, ScheduleRouterPostSetPayload, TwitchRouterPostSchedulePayload } from '../../../shared/src/types';
import { Header } from '../components/Header';
import { SchedulerCanvas } from '../components/SchedulerCanvas';
import { fetchGameIcon, isBrowser, SchedulerTable } from '../components/SchedulerTable';
import { SchedulerAdder } from '../components/SchedulerAdder';
import { LoadingSpinner } from '../components/LoadingSpinner';


const Scheduler: React.FC = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [rememberMe, setRememberMe] = useState(isBrowser && !!localStorage.getItem('crispyDBPassword'));
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [sortedSchedules, setSortedSchedules] = useState<ScheduleItem[]>([]);
    const [scheduleImportStartDate, setScheduleImportStartDate] = useState('');
    const [sevenDaysLaterDate, setSevenDaysLaterDate] = useState('');
    const [crispyDBOperationStatus, setCrispyDBOperationStatus] = useState('--');
    const [isPerformingTwitchAPIOperation, setIsPerformingTwitchAPIOperation] = useState(false);
    const [twitchAPIOperationStatus, setTwitchAPIOperationStatus] = useState('--');

    const passwordInputRef = useRef<HTMLInputElement>(null);
    const importJsonTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!(isBrowser && passwordInputRef.current)) return;

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
        const previousMonday = getPreviousMonday();
        setScheduleImportStartDate(previousMonday);
    }, [])

    useEffect(() => {
        setSortedSchedules(sortSchedules(schedules));
        saveScheduleAsJSON();
    }, [schedules]);

    const sortSchedules = (inputSchedules: ScheduleItem[]) => {
        const sortedSchedules = [...inputSchedules].sort((a, b) => {
            const startTimeComparison = a.startDateTimeRFC3339.localeCompare(b.startDateTimeRFC3339);
            return startTimeComparison;
        });

        return sortedSchedules;
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
                setCrispyDBOperationStatus(`Imported ${importedData.schedules.length} schedule item${importedData.schedules.length === 1 ? '' : 's'} from JSON - changes not necessarily reflected in CrispyDB`)
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
            setCrispyDBOperationStatus('Password is required.');
            return;
        }


        const payload: ScheduleRouterPostAuthorizePayload = {
            password,
        };

        try {
            const response = await fetch('/api/v2/schedule/authorize', {
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
            setCrispyDBOperationStatus('Authorization is required.');
            return;
        }

        if (!passwordInputRef.current) return;

        const password = passwordInputRef.current.value;
        if (!password) {
            setCrispyDBOperationStatus('Password is required.');
            return;
        }

        const payload: ScheduleRouterPostSetPayload = {
            schedules,
            password,
        };

        try {
            const response = await fetch('/api/v2/schedule/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Schedule updated successfully:', result);
                setCrispyDBOperationStatus(`CrispyDB schedule updated with ${payload.schedules.length} items!`);
            } else {
                const errorData = await response.text();
                console.error('Failed to update schedule:', errorData);
                setCrispyDBOperationStatus('Failed to update CrispyDB schedule. Please try again.');
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setCrispyDBOperationStatus('An error occurred while updating the CrispyDB schedule.');
        }
    };

    const importScheduleFromCrispyDB = async (event) => {
        event.preventDefault();

        if (!isAuthorized) {
            setCrispyDBOperationStatus('Authorization is required.');
            return;
        }

        if (!passwordInputRef.current) return;

        const password = passwordInputRef.current.value;
        if (!password) {
            setCrispyDBOperationStatus('Password is required.');
            return;
        }

        const payload: ScheduleRouterPostGetPayload = {
            scheduleStartDate: scheduleImportStartDate,
            password,
        };

        try {
            const response = await fetch('/api/v2/schedule/get', {
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
                        startDateTimeRFC3339: row.startDateTimeRFC3339,
                        endDateTimeRFC3339: row.endDateTimeRFC3339,
                        ianaTimeZoneName: row.ianaTimeZoneName,
                        game: row.game,
                        description: row.description,
                        iconUrl: ico,
                        twitchScheduleBroadcastID: row.twitchScheduleBroadcastID
                    })
                }

                setSchedules(importedScheduleItems);

                console.log('Schedule imported successfully! Resulting \`ScheduleItems\`:', importedScheduleItems);
                setCrispyDBOperationStatus(`${importedScheduleItems.length} schedule item${importedScheduleItems.length === 1 ? '' : 's'} imported from CrispyDB!`);
            } else {
                const errorData = await response.text();
                console.error('Failed to import schedule:', errorData);
                setCrispyDBOperationStatus('Failed to import schedule from CrispyDB. Please try again.');
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setCrispyDBOperationStatus('An error occurred while importing the schedule from CrispyDB.');
        }
    }

    const setTwitchSchedule = async (event) => {
        event.preventDefault();

        setIsPerformingTwitchAPIOperation(true);

        if (!isAuthorized) {
            setTwitchAPIOperationStatus('Authorization is required.');
            setIsPerformingTwitchAPIOperation(false);
            return;
        }

        if (!passwordInputRef.current) {
            setIsPerformingTwitchAPIOperation(false);
            return;
        }

        const password = passwordInputRef.current.value;
        if (!password) {
            setTwitchAPIOperationStatus('Password is required.');
            setIsPerformingTwitchAPIOperation(false);
            return;
        }

        // Determine startDateString and endDateString based on the earliest and latest ScheduleItem
        let minStartDate: Date | undefined;
        let maxEndDate: Date | undefined;

        schedules.forEach(item => {
            const startDateTime = new Date(item.startDateTimeRFC3339);
            const endDateTime = new Date(item.endDateTimeRFC3339);

            if (!minStartDate || startDateTime < minStartDate) {
                minStartDate = startDateTime;
            }

            if (!maxEndDate || endDateTime > maxEndDate) {
                maxEndDate = endDateTime;
            }
        });

        if (!minStartDate || !maxEndDate) {
            setTwitchAPIOperationStatus('No valid schedule items found.');
            setIsPerformingTwitchAPIOperation(false);
            return;
        }

        const startDateString = minStartDate.toISOString();
        const endDateString = maxEndDate.toISOString();

        const payload: TwitchRouterPostSchedulePayload = {
            password,
            startDateString,
            endDateString,
        };

        try {
            const response = await fetch('/api/v2/twitch/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Twitch schedule updated successfully:', result);
                setTwitchAPIOperationStatus(`Twitch schedule updated!`);
            } else {
                const errorData = await response.text();
                console.error('Failed to update Twitch schedule:', errorData);
                setTwitchAPIOperationStatus(errorData);
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setTwitchAPIOperationStatus(error);
        }

        setIsPerformingTwitchAPIOperation(false);
    }

    return (
        <div className="flex font-sans justify-center md:px-16 md:pt-20 pb-20 overflow-y-auto min-h-screen relative max-w-full bg-neutral-900/50 dark">
            <SEOHeader title="Crispy's Stream Scheduler" />
            <Background />
            <Header />

            <div className="p-1 md:p-4 max-w-full flex flex-col items-center gap-4 bg-white/75 dark:bg-transparent backdrop-blur-lg backdrop-brightness-50 text-neutral-900 dark:text-slate-50 md:rounded-lg shadow-md relative">
                <h1 className='text-2xl md:text-3xl font-semibold'>Crispy's Stream Scheduler</h1>
                <div className='w-full flex justify-center items-center gap-4 flex-col md:flex-row'>
                    <SchedulerAdder schedules={schedules} setSchedules={setSchedules} />
                    <SchedulerCanvas sortedSchedules={sortedSchedules} />
                </div>

                <SchedulerTable sortedSchedules={sortedSchedules} setSchedules={setSchedules} passwordInputRef={passwordInputRef} isAuthorized={isAuthorized} setOperationStatus={setCrispyDBOperationStatus} />

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
                        <p className='italic font-mono mb-2'>Status: {crispyDBOperationStatus}</p>
                        <div className='flex flex-col gap-4'>
                            <div className='w-full flex flex-col gap-2'>
                                <button
                                    onClick={updateCrispyDBSchedule}
                                    disabled={!isAuthorized}
                                    className="btn-primary"
                                >
                                    {isAuthorized ? <CloudArrowUpIcon className='w-5 h-5' /> : <LockClosedIcon className='w-5 h-5' />}
                                    <span>Update CrispyDB from Table</span>
                                </button>
                            </div>
                            <div className='w-full flex flex-col gap-2'>
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
                                    <span>Import {scheduleImportStartDate} - {sevenDaysLaterDate} from CrispyDB</span>
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className='flex flex-col w-full max-w-96 grow-0 shrink'>
                        <h2 className='font-semibold text-lg mb-0.5'>Twitch API Operations</h2>
                        <p className='italic font-mono mb-2'>Status: {twitchAPIOperationStatus}</p>
                        <div className='flex flex-col gap-4'>
                            <div className='w-full flex flex-col gap-2'>
                                <button
                                    onClick={setTwitchSchedule}
                                    disabled={!isAuthorized || isPerformingTwitchAPIOperation}
                                    className="btn-primary"
                                >
                                    {isPerformingTwitchAPIOperation ? <LoadingSpinner className='w-5 h-5' /> : isAuthorized ? <ExclamationTriangleIcon className='w-5 h-5' /> : <LockClosedIcon className='w-5 h-5' />}
                                    <span>Update Twitch Schedule from Table</span>
                                </button>
                            </div>
                        </div>
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
