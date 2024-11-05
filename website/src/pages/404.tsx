import React from 'react';
import { Layout } from "../components/Layout";
import SEOHeader from '../components/SEOHeader';
import { StaticImage } from 'gatsby-plugin-image';
import { Background } from '../components/Background';
import { SpinningBorderedTot } from '../components/SpinningBorderedTot';

const IndexPage = ({ data }) => {
    return (
        <Layout showAttribution={false}>
            <SEOHeader title="Tot Not Found" />
            <Background />
            <div className='min-h-screen flex items-center justify-center'>
                <div className='bg-neutral-900/90 rounded-md w-full max-w-lg mt-8 mx-2 md pt-4 px-4 md:px-8 z-20 text-neutral-50 flex flex-col justify-center'>
                    <SpinningBorderedTot />
                    <h1 className='font-semibold text-2xl md:text-4xl my-8'>Tot Not Found</h1>
                </div>
            </div>
        </Layout>
    )
}

export default IndexPage;