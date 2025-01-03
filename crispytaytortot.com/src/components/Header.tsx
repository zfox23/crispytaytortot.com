import { Link } from 'gatsby';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SpinningBorderedTot } from './SpinningBorderedTot';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { CalendarIcon, ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export const DesktopHeader = ({ classList = "" }) => {
    const defaultclassList = `hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 min-w-72 max-w-[calc(72rem-1rem)] h-16 transition-{translate} duration-300 font-semibold text-xl z-40 pointer-events-none items-start mx-auto rounded-b-md backdrop-blur-lg text-neutral-900 dark:text-slate-50 backdrop-brightness-200 dark:backdrop-brightness-50 bg-slate-50/75 dark:bg-transparent`;
    let classes = twMerge(defaultclassList, classList);

    return (
        <header className={classes}>
            <div className="pointer-events-auto mx-auto px-4 pt-2 pb-2 rounded-b-md flex justify-center items-center gap-6 ">
                <SpinningBorderedTot />
                {/* <Link to="/schedule/" className='hover:underline'>Schedule</Link> */}
                <Link to="/store/" className='hover:underline'>Store</Link>
                {/* <Link to="/about/" className='hover:underline'>About</Link> */}
            </div>
        </header>
    );
}

const HeaderItem = ({ icon, text, to }) => {
    return (
        <MenuItem>
            {({ focus }) => (
                <Link to={to} className={`flex items-center gap-2 py-3 pl-3 pr-6 ${focus ? 'bg-indigo-600/60' : ''}`}>
                    <div className='w-5 h-5 relative -top-[1px]'>{icon}</div>
                    <span>{text}</span>
                </Link>
            )}
        </MenuItem>
    )
}

const MobileHeader = ({ classList }) => {
    const defaultclassList = `flex md:hidden fixed z-40 top-3 right-0 flex-col items-end transition-{translate} duration-300 text-neutral-900 dark:text-slate-50`;
    let classes = twMerge(defaultclassList, classList);

    return (
        <header className={classes}>

            <Menu>
                {({ open }) => (
                    <>
                        <MenuButton id="mobileHeaderMenuButton" tabIndex={0} className={`p-2 w-14 h-14 overflow-clip backdrop-blur-lg backdrop-brightness-200 dark:backdrop-brightness-50 bg-slate-50/75 dark:bg-transparent hover:bg-indigo-600/60 focus:bg-indigo-600/60 active:bg-indigo-600/60 rounded-l-md`}>
                            <Bars3Icon className='' />
                        </MenuButton>
                        <Transition
                            enter="transition duration-250 ease-out"
                            enterFrom="transform translate-x-full"
                            enterTo="transform translate-x-0"
                            leave="transition duration-200 ease-out"
                            leaveFrom="transform translate-x-0"
                            leaveTo="transform translate-x-full"
                        >
                            <MenuItems className='backdrop-blur-lg backdrop-brightness-200 dark:backdrop-brightness-50 bg-slate-50/75 dark:bg-transparent font-semibold text-lg flex flex-col items-stretch divide-y divide-neutral-400/80 dark:divide-neutral-300/10 rounded-l-md shadow-lg overflow-clip'>
                                <div className="group w-full">
                                    <HeaderItem
                                        to="/"
                                        text="Home"
                                        icon={<SpinningBorderedTot imgClassName="w-5" />}
                                    />
                                </div>
                                <div className="w-full">
                                    {/* <HeaderItem
                                        to="/schedule/"
                                        text="Schedule"
                                        icon={<CalendarIcon />}
                                    /> */}
                                    <HeaderItem
                                        to="/store/"
                                        text="Store"
                                        icon={<ShoppingBagIcon />}
                                    />
                                </div>
                                {/* <div className="w-full">
                                    <HeaderItem
                                        to="/about/"
                                        text="About"
                                        icon={<UserCircleIcon />}
                                    />
                                </div> */}
                            </MenuItems>
                        </Transition>
                    </>
                )}
            </Menu>
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
