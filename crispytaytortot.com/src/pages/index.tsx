import React, { useEffect, useRef, useState } from 'react';
import { Layout } from "../components/Layout";
import SEOHeader from "../components/SEOHeader";
import { StaticImage } from 'gatsby-plugin-image';
import { Button, ButtonTypes } from '../components/Button';
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import DiscordIcon from '../components/icons/DiscordIcon';
import TwitchIcon from '../components/icons/TwitchIcon';
import BlueSkyIcon from '../components/icons/BlueSkyIcon';
import Divider from '../components/Divider';
import { SpinningBorderedTot } from '../components/SpinningBorderedTot';
import { isBrowser } from '../components/helpers';
import { useEventListenerWindow } from '../hooks/useEventListener';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig as any);
// @ts-ignore
const themeLg = parseInt((fullConfig.theme?.screens?.lg).slice(0, -2));

const IndexPage = ({ data }) => {
    const [isLiveOnYouTube, setIsLiveOnYouTube] = useState(false);
    const [isLiveOnTwitch, setIsLiveOnTwitch] = useState(false);
    const linksContainer = useRef<HTMLDivElement>(null);
    const videoContainer = useRef<HTMLIFrameElement>(null);

    const resizeStreamContainer = () => {
        if (!(isBrowser && linksContainer.current && videoContainer.current)) return;

        const linksRect = linksContainer.current.getBoundingClientRect();

        let width, height;

        if (window.innerWidth > themeLg) {
            width = window.innerWidth - linksRect.width;
            height = Math.min(linksRect.height, width * 9 / 16);
        } else {
            width = window.innerWidth;
            height = width * 9 / 16;
        }

        videoContainer.current.style.width = `${width}px`;
        videoContainer.current.style.height = `${height}px`;
    }

    useEventListenerWindow("resize", resizeStreamContainer);
    useEffect(resizeStreamContainer, [isLiveOnTwitch, isLiveOnYouTube])

    useEffect(() => {
        const fetchTwitchInfo = async () => {
            try {
                const response = await fetch('/api/v1/twitch/info');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                setIsLiveOnTwitch(data.isLive);
                // Assumption
                setIsLiveOnYouTube(data.isLive);
            } catch (error) {
                console.error('Failed to fetch Twitch info:', error);
            }
        };

        fetchTwitchInfo();
    }, []);

    return (
        <Layout>
            <SEOHeader title="Home" />
            <div
                style={{
                    backgroundImage: "url('/images/channel-offline-image-1920x1080.jpg')",
                    backgroundSize: "cover"
                }}
                className='absolute inset-0'>
            </div>
            <div
                className={`absolute inset-0 bg-neutral-900 transition-opacity mix-blend-hard-light duration-[2000ms] ${isLiveOnTwitch || isLiveOnYouTube ? 'opacity-60' : 'opacity-20'}`}>
            </div>
            <div className={`flex w-full max-w-[1982px] relative ${isLiveOnTwitch || isLiveOnYouTube ? "flex-col-reverse" : "flex-col"} lg:flex-row items-center lg:items-start justify-center text-neutral-50 mt-20 md:mt-24 mb-16 md:px-2 gap-2`}>
                <div ref={linksContainer} className='pt-4 backdrop-blur-lg text-neutral-900 dark:text-slate-50 backdrop-brightness-200 dark:backdrop-brightness-50 bg-slate-50/75 dark:bg-transparent pb-12 px-2 md:px-4 rounded-md'>
                    <div className='text-center mb-3'>
                        <h1 className='font-semibold text-3xl'>CrispyTaytortot</h1>
                        <p className='text-sm opacity-80'>He/They/Carbohydrate</p>
                    </div>

                    <div className='text-center mb-5 space-y-1'>
                        <p>IT Professional | WX Enthusiast</p>
                        <p>Partnered with</p>
                        <p className='!-mt-0.5'>
                            <span>
                                <a className="font-semibold hover:underline" href="https://twitter.com/Twitch" target='_blank'>@Twitch</a> | </span>
                            <span>
                                <a className="font-semibold hover:underline" href="https://twitter.com/FrontierDev" target='_blank'>@FrontierDev</a> | </span>
                            <span>
                                <a className="font-semibold hover:underline" href="https://twitter.com/Ubisoft" target='_blank'>@Ubisoft</a></span>
                        </p>
                        <p>Space | Management | Simulation</p>
                    </div>

                    <Divider className='mb-5 max-w-xl' />

                    <div className='w-full min-w-96 max-w-3xl px-4 md:px-8 pt-4 flex flex-col items-center'>
                        <Button
                            className='mb-4 bg-neutral-50 text-indigo-700 hover:bg-neutral-100 hover:text-indigo-800 shadow-md active:shadow-sm shadow-neutral-800/50'
                            buttonText="Twitch"
                            type={ButtonTypes.ALink}
                            onClick="https://twitch.tv/crispytaytortot"
                            filled={true}
                            buttonIconLeft={<TwitchIcon
                                className='w-[20px] h-[21px]' />} />

                        <Button
                            className='mb-4'
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
                            className='mb-16'
                            buttonText="Discord"
                            type={ButtonTypes.ALink}
                            onClick="https://crispytaytortot.com/discord"
                            filled={true}
                            buttonIconLeft={<DiscordIcon
                                className='w-[24px] h-[18px]' />} />

                        <Button
                            className='mb-4 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 hover:border-indigo-700'
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
                            buttonText="Bluesky"
                            type={ButtonTypes.ALink}
                            onClick="https://bsky.app/profile/crispytaytortot.bsky.social"
                            filled={true}
                            buttonIconLeft={<BlueSkyIcon
                                className='w-[22px] h-[20px]' />} />

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
                            buttonText="Merch"
                            type={ButtonTypes.ALink}
                            onClick="https://crispytaytortot.store/"
                            filled={true}
                            buttonIconLeft={<ShoppingBagIcon
                                className='h-6 w-6' />} />

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
                </div>
                <div
                    ref={videoContainer}
                    className='w-full md:rounded-md'>
                    {isLiveOnYouTube ?
                        <iframe
                            className={`w-full h-full md:rounded-md`}
                            src="https://www.youtube.com/embed/live_stream?channel=UC0UWPFkDBF12ZIX1MMxBdLQ&autoplay=true&mute=1"
                            height="100%"
                            width="100%"
                            allowFullScreen={true}>
                        </iframe>
                        :
                        <iframe
                            className={`w-full h-full md:rounded-md`}
                            src="https://www.youtube.com/embed/HnXKtKPfMNo"
                            height="100%"
                            width="100%"
                            allowFullScreen={true}>
                        </iframe>}
                    {/* {isLiveOnTwitch ?
                        <iframe
                            ref={twitchContainer}
                            className='md:rounded-md'
                            src="https://player.twitch.tv/?channel=crispytaytortot&parent=localhost&muted=true"
                            height="100%"
                            width="100%"
                            allowFullScreen={true}>
                        </iframe>
                        : null} */}
                </div>
            </div>
        </Layout>
    )
}

export default IndexPage;

