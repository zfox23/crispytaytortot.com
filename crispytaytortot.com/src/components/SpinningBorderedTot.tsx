import React from 'react';

export const SpinningBorderedTot = () => {
    return (
        <a className='rounded-full cursor-pointer p-1 border-2 border-solid bg-neutral-900/90 group border-indigo-800 w-24 h-24 relative mx-auto overflow-clip flex items-center justify-center' href="/">
            <img className='group-hover:animate-spin p-4' loading='eager' src="/images/Totmoji.png" alt="CrispyTaytortot's avatar is a cartoon tater tot with eyes and a happy expression." />
        </a>
    )
}