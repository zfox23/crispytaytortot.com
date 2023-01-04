import React from 'react';
import { twMerge } from 'tailwind-merge';

export const DesktopHeader = ({ classList = "" }) => {
    const defaultclassList = `hidden md:flex font-bebas absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[calc(72rem-1rem)] h-16 transition-{translate} duration-300 font-semibold text-2xl text-slate-50 z-40 pointer-events-none items-start mx-auto rounded-b-md`;
    let classes = twMerge(defaultclassList, classList);

    return (
        <header className={classes}>
        </header>
    );
}

const MobileHeader = ({ classList }) => {
    const defaultclassList = `flex md:hidden fixed z-40 top-3 right-0 flex-col items-end transition-{translate} duration-300`;
    let classes = twMerge(defaultclassList, classList);

    return (
        <header className={classes}>
        </header>
    );
}

export const Header = ({ desktopClassList, mobileClassList }) => {
    return (
        <>
            <MobileHeader classList={mobileClassList} />
            <DesktopHeader classList={desktopClassList} />
        </>
    )
}
