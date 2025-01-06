import React from 'react';

export const Background = ({ }) => {
    return (
        <div className='absolute inset-0'>
            <div
                style={{
                    backgroundImage: "url('/images/channel-offline-image-1920x1080.jpg')",
                    backgroundSize: "cover"
                }}
                className='absolute inset-0'>
            </div>
            <div
                className={`absolute inset-0 bg-neutral-900 transition-opacity mix-blend-hard-light duration-[2000ms] opacity-20`}>
            </div>
        </div>
    )
}