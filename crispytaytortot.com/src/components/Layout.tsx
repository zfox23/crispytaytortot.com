import React from "react";
import { Helmet } from "react-helmet";
import { Footer } from "./Footer";
import { Header } from "./Header";

export const Layout = ({ children, showAttribution = true, desktopClassList = "", mobileClassList = "" }) => {
    return (
        <React.Fragment>
            <Helmet htmlAttributes={{
                lang: 'en',
            }} />
            <div className='relative flex flex-col min-h-screen dark'>
                <Header desktopClassList={desktopClassList} mobileClassList={mobileClassList} />
                <main className="grow flex flex-col items-center bg-neutral-800 relative">
                    {children}
                </main>
                {showAttribution ? <Footer /> : null}
            </div>
        </React.Fragment>
    )
}
