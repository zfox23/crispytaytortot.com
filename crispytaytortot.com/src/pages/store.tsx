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
const themeMd = parseInt((fullConfig.theme?.screens?.md).slice(0, -2));

const StorePage = ({ }) => {
    return (
        <Layout>
            <SEOHeader title="Store" />
            <div
                style={{
                    backgroundImage: "url('/images/channel-offline-image-1920x1080.jpg')",
                    backgroundSize: "cover"
                }}
                className='absolute inset-0'>
            </div>
            <iframe
                className='relative rounded-md w-full px-2 mt-20 md:mt-24 max-w-[2152px]'
                src="https://embed.creator-spring.com/widget?slug=my-store-11636080&per=30&currency=&page=1&layout=grid-sm-4&theme=dark"
                title="Crispy Merch Merch store powered by Spring"
                width="100%"
                height="960"
                data-reactroot="">
            </iframe>
        </Layout>
    )
}

export default StorePage;