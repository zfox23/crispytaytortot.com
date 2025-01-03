import React from 'react';
import { Layout } from "../components/Layout";
import SEOHeader from "../components/SEOHeader";
import { StaticImage } from 'gatsby-plugin-image';
import { Button, ButtonTypes } from '../components/Button';
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import DiscordIcon from '../components/icons/DiscordIcon';
import TwitchIcon from '../components/icons/TwitchIcon';
import BlueSkyIcon from '../components/icons/BlueSkyIcon';
import Divider from '../components/Divider';
import { Background } from '../components/Background';
import { SpinningBorderedTot } from '../components/SpinningBorderedTot';

const IndexPage = ({ data }) => {
    return (
        <Layout>
            <SEOHeader title="Home" />
            <Background />
            <div className='w-full max-w-3xl flex flex-col items-center z-20 text-neutral-50 px-2 md:px-4'>
                <div className='bg-neutral-900/90 w-full max-w-lg mt-8 mx-2 rounded-t-md pt-4 px-4 md:px-8'>
                    <SpinningBorderedTot />
                    <div className='text-center mb-3'>
                        <h1 className='font-semibold text-neutral-50 text-3xl'>CrispyTaytortot</h1>
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
                </div>

                <div className='w-full max-w-lg bg-neutral-900/90 rounded-b-md px-4 md:px-8 pt-4 mb-16 pb-12 flex flex-col items-center'>
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
        </Layout>
    )
}

export default IndexPage;

