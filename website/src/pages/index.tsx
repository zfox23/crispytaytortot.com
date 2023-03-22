import React, { useEffect, useState } from 'react';
import { Layout } from "../components/Layout";
import SEOHeader from "../components/SEOHeader";
import { StaticImage } from 'gatsby-plugin-image';
import { Button, ButtonTypes } from '../components/Button';
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { Transition } from '@headlessui/react'
import DiscordIcon from '../components/icons/DiscordIcon';
import TwitchIcon from '../components/icons/TwitchIcon';
import Divider from '../components/Divider';
import { DivOnScreen } from '../components/DivOnScreen';

import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-luxon';
ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const IndexPage = ({ data }) => {
    const [numSubscribers, setNumSubscribers] = useState<number>(-1);
    const [numFollowers, setNumFollowers] = useState<number>(-1);
    const [viewerCount, setViewerCount] = useState<number>(-1);
    const [gameName, setGameName] = useState<string>();
    const [showingTwitchStats, setShowingTwitchStats] = useState(false);

    const [twitchViewership, setTwitchViewership] = useState<any>();
    const [twitchViewershipAverage, setTwitchViewershipAverage] = useState(-1);
    const [showingTwitchViewership, setShowingTwitchViewership] = useState(false);

    useEffect(() => {
        fetch('/api/v1/twitch-info', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                setNumSubscribers(parseInt(data.subCount));
                setNumFollowers(parseInt(data.followerCount));
                setViewerCount(parseInt(data.viewerCount));
                setGameName(data.gameName);
                setShowingTwitchStats(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [])

    useEffect(() => {
        fetch('/api/v1/twitch/avg-viewers-30-days', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                const viewershipValues = data.map(a => {
                    return { x: new Date(a.timestamp), y: a.viewerCount }
                });
                const liveValues = data.map(a => {
                    // We map "live" to "current viewerCount" so the data overlaps.
                    return { x: new Date(a.timestamp), y: a.channelIsLive === 1 ? a.viewerCount : 0, live: a.channelIsLive === 1 ? true : false }
                });
                let borderColor: string[] = [];
                let pointBackgroundColor: string[] = [];
                let pointRadius: number[] = []
                let viewership = {
                    datasets: [
                        {
                            data: liveValues,
                            borderColor,
                            pointBackgroundColor,
                            pointRadius,
                            label: "Live",
                        },
                        {
                            data: viewershipValues,
                            borderColor,
                            pointBackgroundColor,
                            label: "# Viewers"
                        }
                    ]
                }
                for (let i = 0; i < viewership.datasets[0].data.length; i++) {
                    if (viewership.datasets[0].data[i].live) {
                        borderColor.push("#ff0000");
                        pointBackgroundColor.push("#ff0000");
                        pointRadius.push(4);
                    } else {
                        borderColor.push("#e8901a");
                        pointBackgroundColor.push("#e8901a");
                        pointRadius.push(2);
                    }
                }
                setTwitchViewership(viewership);

                let average = 0;
                for (let i = 0; i < viewershipValues.length; i++) {
                    if (viewershipValues[i].y > 0) {

                    }
                }

                console.log(viewershipValues[viewershipValues.length - 1].x - viewershipValues[0].x)
                setTwitchViewershipAverage(0);
                setShowingTwitchViewership(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [])

    return (
        <Layout>
            <SEOHeader title="Home" />
            <div className='!absolute inset-0 z-10'>
                <StaticImage className='!absolute inset-0' src="../data/images/channel-offline-image-1920x1080.jpg" alt="Warm, crispy potato tots." />
                <div className='absolute inset-0 bg-neutral-900/50' />
            </div>
            <div className='bg-neutral-900/90 w-[calc(100%-16px)] max-w-xl flex flex-col items-center z-20 mb-16 mt-8 mx-2 rounded-md pt-4 pb-12 px-4'>
                <div className='text-neutral-50'>
                    <div className='rounded-full cursor-pointer p-1 border-2 border-solid bg-neutral-900/90 group border-indigo-800 w-24 h-24 relative mx-auto overflow-clip flex items-center justify-center'>
                        <StaticImage height={72} quality={90} placeholder='blurred' className='group-hover:animate-spin' loading='eager' src="../data/images/Totmoji.png" alt="CrispyTaytortot's avatar is a cartoon tater tot with eyes and a happy expression." />
                    </div>
                    <div className='text-center mb-3'>
                        <h1 className='font-semibold text-neutral-50 text-3xl'>CrispyTaytortot</h1>
                        <p className='text-sm opacity-80'>He/They/Carbohydrate</p>
                    </div>

                    <div className='text-center mb-5 space-y-1'>
                        <p>IT Professional</p>
                        <p><span>Partnered with</span> <br /><a className="font-semibold" href="https://twitter.com/Twitch" target='_blank'>@Twitch</a> | <a className="font-semibold" href="https://twitter.com/EliteDangerous" target='_blank'>@EliteDangerous</a> | <a className="font-semibold" href="https://twitter.com/Ubisoft" target='_blank'>@Ubisoft</a></p>
                        <p>Space | Management | RPGs</p>
                    </div>
                </div>

                <Divider className='mb-5' />

                <DivOnScreen className='w-full max-w-md mx-auto flex flex-col items-center mb-4 gap-1 bg-indigo-700 rounded-md px-4 py-4'>
                    <Button
                        className='mb-1 bg-neutral-50 text-indigo-700 hover:bg-neutral-100 hover:text-indigo-800 shadow-md active:shadow-sm shadow-neutral-800/50'
                        buttonText="Twitch"
                        type={ButtonTypes.ALink}
                        onClick="https://twitch.tv/crispytaytortot"
                        filled={true}
                        buttonIconLeft={<TwitchIcon
                            className='w-[20px] h-[21px]' />} />

                    <Transition
                        show={showingTwitchStats}
                        className='flex flex-row flex-wrap justify-center gap-8 text-xl w-full text-neutral-50'
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 h-0"
                        enterTo="opacity-100 scale-100 h-6"
                        leave="linear duration-0"
                        leaveFrom="opacity-100 scale-100 h-6"
                        leaveTo="opacity-0 scale-95 h-0">
                        {viewerCount > 0 ?
                            <a className='text-center w-full mb-2 text-base' href="https://twitch.tv/crispytaytortot" target="_blank"><span className='underline'>Playing {gameName} for {viewerCount.toLocaleString()} viewers</span></a>
                            : null}
                        <p className='leading-6'>{numFollowers.toLocaleString()} Followers</p>
                        {numSubscribers > 0 ? <p className='leading-6'>{numSubscribers.toLocaleString()} Subscribers</p> : null}
                    </Transition>

                    <Transition
                        show={showingTwitchViewership}
                        className='w-full text-neutral-50'
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="linear duration-0"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95">
                            <Divider className='mt-4 border-neutral-200/25' />
                        <div className=''>
                            <Line className='w-full h-64' options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    title: {
                                        display: true,
                                        position: "top",
                                        text: "Viewers",
                                        color: "#f5f5f5"
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (context: any) => {
                                                if (context.dataset.label === "Live" && context.raw.live === false) {
                                                    return "Not Live"
                                                } else if (context.dataset.label === "Live" && context.raw.live === true) {
                                                    return "Live"
                                                } else {
                                                    return `# Viewers: ${context.raw.y}`
                                                }
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        grid: {
                                            display: false,
                                        },
                                        type: "time",
                                        time: {
                                            unit: "minute"
                                        },
                                        ticks: {
                                            color: "#f5f5f5",
                                            maxTicksLimit: 5,
                                        },
                                        border: {
                                            color: "#f5f5f588",
                                        },
                                        title: {
                                            color: "#f5f5f5"
                                        }
                                    },
                                    y: {
                                        grid: {
                                            display: false,
                                        },
                                        beginAtZero: true,
                                        grace: "10%",
                                        ticks: {
                                            precision: 0,
                                            color: "#f5f5f5",
                                        },
                                        border: {
                                            color: "#f5f5f588",
                                        },
                                        title: {
                                            color: "#f5f5f5"
                                        }
                                    }
                                }
                            }} data={twitchViewership} />
                        </div>
                        <p className='text-center'>30-Day Average Viewers: {twitchViewershipAverage.toLocaleString()}</p>
                    </Transition>
                </DivOnScreen>

                <Button
                    className='mb-4'
                    buttonText="Discord"
                    type={ButtonTypes.ALink}
                    onClick="https://crispytaytortot.com/discord"
                    filled={true}
                    buttonIconLeft={<DiscordIcon
                        className='w-[24px] h-[18px]' />} />

                <Button
                    className='mb-16'
                    buttonText="Merch"
                    type={ButtonTypes.ALink}
                    onClick="https://crispytaytortot.store/"
                    filled={true}
                    buttonIconLeft={<ShoppingBagIcon
                        className='h-6 w-6' />} />

                <Button
                    className='mb-4 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 hover:border-indigo-700'
                    buttonText="YouTube"
                    type={ButtonTypes.ALink}
                    onClick="https://youtube.com/crispytaytortot"
                    filled={true}
                    buttonIconLeft={<StaticImage
                        className='w-[24px] h-[16px]'
                        src="../data/images/icons/youtube.svg"
                        placeholder='none'
                        alt="YouTube" />} />

                <Button
                    className='mb-4 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 hover:border-indigo-700'
                    buttonText="Twitter"
                    type={ButtonTypes.ALink}
                    onClick="https://twitter.com/CrispyTaytortot"
                    filled={true}
                    buttonIconLeft={<StaticImage
                        className='w-[18px] h-[16px]'
                        src="../data/images/icons/twitter.svg"
                        placeholder='none'
                        alt="Twitter" />} />

                <Button
                    className='mb-16 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 hover:border-indigo-700'
                    buttonText="TikTok"
                    type={ButtonTypes.ALink}
                    onClick="https://tiktok.com/@crispytaytortot"
                    filled={true}
                    buttonIconLeft={<StaticImage
                        className='w-[14px] h-[16px]'
                        src="../data/images/icons/tiktok.svg"
                        placeholder='none'
                        alt="TikTok" />} />

                <Button
                    className='mb-4 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 hover:border-indigo-700'
                    buttonText="Email"
                    type={ButtonTypes.ALink}
                    onClick="mailto:hello@crispytaytortot.com"
                    linkTarget='_blank'
                    filled={true}
                    buttonIconLeft={<StaticImage
                        className='w-[21px] h-[16px]'
                        src="../data/images/icons/email.svg"
                        placeholder='none'
                        alt="Email CrispyTaytortot" />} />
            </div>
        </Layout>
    )
}

export default IndexPage;

