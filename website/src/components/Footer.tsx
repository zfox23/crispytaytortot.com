import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { Helmet } from 'react-helmet';

export const Footer = ({}) => {
    return (
        <footer className='w-full h-12 box-content z-20'>
            {/* <Helmet>
                <script type="text/javascript">
                    {`
                    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    `}
                </script>
            </Helmet> */}
            <a href="https://zachfox.photography" className='h-12 p-2 group flex justify-center items-center bg-neutral-900/50 rounded-tl-md float-right' target="_blank">
                <p className='text-sm font-semibold text-neutral-50 opacity-60 mr-2'>Designed by</p>
                <StaticImage className='w-6 h-6 opacity-60 group-hover:scale-105 group-active:scale-100 transition-transform duration-75' src="../data/images/zfp-circle.png" alt="The Zach Fox Photography logo." />
            </a>
        </footer>
    )
}
