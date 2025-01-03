import { Link } from 'gatsby';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export const SpinningBorderedTot = ({imgClassName = ''}) => {
    return (
        <Link className='rounded-full cursor-pointer p-1 group relative mx-auto overflow-clip flex items-center justify-center' to="/">
            <img className={twMerge('group-hover:animate-spin w-8 h-auto', imgClassName)} loading='eager' src="/images/Totmoji.png" alt="CrispyTaytortot's avatar is a cartoon tater tot with eyes and a happy expression." />
        </Link>
    )
}