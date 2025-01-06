import React from 'react';
import { Layout } from "../../../crispytaytortot.com/src/components/Layout";
import SEOHeader from "../../../crispytaytortot.com/src/components/SEOHeader";
import { Button, ButtonTypes } from '../../../crispytaytortot.com/src/components/Button';
import { CalendarIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
import Divider from '../../../crispytaytortot.com/src/components/Divider';
import { Background } from '../../../crispytaytortot.com/src/components/Background';
import { SpinningBorderedTot } from '../../../crispytaytortot.com/src/components/SpinningBorderedTot';
import { Footer } from '../../../crispytaytortot.com/src/components/Footer';

const IndexPage = ({ }) => {
    return (
        <div className='relative flex flex-col min-h-screen dark'>
            <main className="grow flex flex-col items-center bg-neutral-800 relative">
                <SEOHeader title="Home" />
                <Background />
                <div className='w-full max-w-3xl flex flex-col items-center z-20 text-neutral-50 px-2 md:px-4'>
                    <div className='bg-neutral-900/90 w-full max-w-lg mt-8 mx-2 rounded-t-md pt-4 px-4 md:px-8'>
                        <SpinningBorderedTot />
                        <div className='text-center mb-3'>
                            <h1 className='font-semibold text-neutral-50 text-3xl'>CrispyTaytortot's Tools</h1>
                        </div>

                        <Divider className='mb-5 max-w-xl' />
                    </div>

                    <div className='w-full max-w-lg bg-neutral-900/90 rounded-b-md px-4 md:px-8 pt-4 mb-16  flex flex-col items-center'>
                        <Button
                            className='mb-8 bg-neutral-50 text-indigo-700 hover:bg-neutral-100 hover:text-indigo-800 shadow-md active:shadow-sm shadow-neutral-800/50'
                            buttonText="crispytaytortot.com"
                            type={ButtonTypes.ALink}
                            onClick="https://crispytaytortot.com"
                            filled={true}
                            buttonIconLeft={<GlobeAltIcon
                                className='w-[20px] h-[21px]' />} />

                        <Button
                            className='mb-4'
                            buttonText="Scheduler"
                            type={ButtonTypes.Link}
                            onClick="/scheduler/"
                            filled={true}
                            buttonIconLeft={<CalendarIcon
                                className='h-6 w-6' />} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default IndexPage;
