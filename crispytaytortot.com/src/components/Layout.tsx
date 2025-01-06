import React from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export const Layout = ({ children, showAttribution = true, desktopClassList = "", mobileClassList = "" }) => {
    return (
        <div className='relative flex flex-col min-h-screen dark'>
            <Header desktopClassList={desktopClassList} mobileClassList={mobileClassList} />
            <main className="grow flex flex-col items-center bg-neutral-800 relative">
                {children}
            </main>
            {showAttribution ? <Footer /> : null}
        </div>
    )
}
