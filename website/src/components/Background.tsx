import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

export const Background = ({ }) => {
    return (
        <div className='!absolute inset-0 z-10'>
            <StaticImage className='!absolute inset-0' src="../data/images/channel-offline-image-1920x1080.jpg" alt="Warm, crispy potato tots." />
            <div className='absolute inset-0 bg-neutral-900/50' />
        </div>
    )
}