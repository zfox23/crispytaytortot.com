import React from 'react';

export const Background = ({ }) => {
    return (
        <div
            style={{
                backgroundImage: "url('/images/channel-offline-image-1920x1080.jpg')",
                backgroundSize: "cover"
            }}
            className='absolute inset-0 bg-neutral-900/50 opacity-80'>
        </div>
    )
}