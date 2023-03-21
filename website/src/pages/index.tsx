import React, { useEffect, useState } from 'react';
import { Layout } from "../components/Layout";
import SEOHeader from "../components/SEOHeader";
import { StaticImage } from 'gatsby-plugin-image';
import { Button, ButtonTypes } from '../components/Button';
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Transition } from '@headlessui/react'

const IndexPage = ({ data }) => {
    const [numSubscribers, setNumSubscribers] = useState();
    const [numFollowers, setNumFollowers] = useState();
    const [viewerCount, setViewerCount] = useState(-1);
    const [gameName, setGameName] = useState();
    const [showingTwitchStats, setShowingTwitchStats] = useState(false);

    useEffect(() => {
        fetch('/api/v1/twitch-info', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                setNumSubscribers(data.subCount);
                setNumFollowers(data.followerCount);
                setViewerCount(data.viewerCount);
                setGameName(data.gameName);
                setShowingTwitchStats(true);
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
            <div className='bg-neutral-900/90 w-[calc(100%-16px)] max-w-xl flex flex-col items-center z-20 my-16 mx-2 rounded-md pt-4 pb-12 px-4'>
                <div className='mb-8'>
                    <div className='rounded-full cursor-pointer p-1 border-2 border-solid bg-neutral-900/90 group border-indigo-800 w-24 h-24 relative mx-auto overflow-clip flex items-center justify-center'>
                        <StaticImage height={72} quality={90} placeholder='blurred' className='group-hover:animate-spin' loading='eager' src="../data/images/Totmoji.png" alt="CrispyTaytortot's avatar is a cartoon tater tot with eyes and a happy expression." />
                    </div>
                    <p className='font-semibold text-neutral-50 text-3xl'>CrispyTaytortot</p>
                </div>

                <div className='w-full max-w-md mx-auto transition-all duration-300 flex flex-col items-center mb-4 gap-1 bg-indigo-700 rounded-md px-4 py-4'>
                    <Button
                        className='mb-1'
                        buttonText="Twitch"
                        type={ButtonTypes.ALink}
                        onClick="https://twitch.tv/crispytaytortot"
                        filled={true}
                        buttonIconLeft={<StaticImage
                            className='w-[20px] h-[21px]'
                            src="../data/images/icons/twitch.svg"
                            placeholder='none'
                            alt="Twitch" />} />

                    <Transition
                        show={showingTwitchStats}
                        className='flex flex-row flex-wrap justify-between text-xl w-full text-neutral-50'
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="linear duration-0"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95">
                        {viewerCount > 0 ?
                        <a className='text-center w-full mb-2 text-base' href="https://twitch.tv/crispytaytortot" target="_blank"><span  className='underline'>Playing {gameName} for {viewerCount} viewers</span></a>
                        : null}
                        <p className='leading-6'>{numFollowers} Followers</p>
                        <p className='leading-6'>{numSubscribers} Subscribers</p>
                    </Transition>
                </div>

                <Button
                    className='mb-4'
                    buttonText="Discord"
                    type={ButtonTypes.ALink}
                    onClick="https://crispytaytortot.com/discord"
                    filled={true}
                    buttonIconLeft={<StaticImage
                        className='w-[24px] h-[18px]'
                        placeholder='none'
                        src="../data/images/icons/discord.svg"
                        alt="Discord" />} />

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

