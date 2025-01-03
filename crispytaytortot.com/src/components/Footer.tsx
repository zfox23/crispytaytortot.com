import React from 'react';

export const Footer = ({ }) => {
    return (
        <footer className='w-full h-12 box-content absolute bottom-0 right-0 z-20'>
            <a href="https://zachfox.photography" className='h-12 p-2 group flex justify-center items-center bg-neutral-900/50 rounded-tl-md float-right' target="_blank">
                <p className='text-sm text-neutral-50 opacity-60 mr-2'>Designed by</p>
                <img className='w-6 h-6 opacity-60 group-hover:scale-105 group-active:scale-100 transition-transform duration-75' src="/images/zfp-circle.png" alt="The Zach Fox Photography logo." />
            </a>
        </footer>
    )
}
