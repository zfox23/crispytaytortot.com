import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownTrayIcon, PaintBrushIcon, XMarkIcon } from "@heroicons/react/24/outline";

const isBrowser = typeof window !== "undefined";

let bgImage, twitchIcon, youTubeIcon, blueskyIcon, tiktokIcon;

export const GAME_ICON_WIDTH_PX = 64;
export const GAME_ICON_HEIGHT_PX = 64;

bgImage = new Image();
bgImage.crossOrigin = "anonymous";
if (isBrowser) {
    twitchIcon = new Image();
    const twitchIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg width="256px" height="268px" preserveAspectRatio="xMidYMid" version="1.1" viewBox="0 0 256 268" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff">
    <path d="m17.458 0-17.458 46.556v186.2h63.983v34.934h34.932l34.897-34.934h52.36l69.828-69.803v-162.95h-238.54zm23.259 23.263h192.01v128.03l-40.739 40.742h-63.992l-34.887 34.885v-34.885h-52.396v-168.77zm64.008 116.41h23.275v-69.825h-23.275v69.825zm63.997 0h23.27v-69.825h-23.27v69.825z" fill="#fff"/>
    </g>
    </svg>`], { type: 'image/svg+xml' });
    const twitchIconURL = URL.createObjectURL(twitchIconBlob);
    twitchIcon.src = twitchIconURL;
    twitchIcon.crossOrigin = "anonymous";

    youTubeIcon = new Image();
    const youTubeIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg width="756.99" height="533.33" version="1.1" viewBox="-35.2 -41.333 192.44 165.33" xmlns="http://www.w3.org/2000/svg">
     <path d="m37.277 76.226v-69.784l61.334 34.893zm136.43-91.742c-2.699-10.162-10.651-18.165-20.747-20.881-18.3-4.936-91.683-4.936-91.683-4.936s-73.382 0-91.682 4.936c-10.096 2.716-18.048 10.719-20.747 20.881-4.904 18.419-4.904 56.85-4.904 56.85s0 38.429 4.904 56.849c2.699 10.163 10.65 18.165 20.747 20.883 18.3 4.934 91.682 4.934 91.682 4.934s73.383 0 91.683-4.934c10.096-2.718 18.048-10.72 20.747-20.883 4.904-18.42 4.904-56.85 4.904-56.85s0-38.43-4.904-56.849" fill="#fff"/>
    </svg>`], { type: 'image/svg+xml' });
    const youTubeIconURL = URL.createObjectURL(youTubeIconBlob);
    youTubeIcon.src = youTubeIconURL;
    youTubeIcon.crossOrigin = "anonymous";

    blueskyIcon = new Image();
    const blueskyIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg fill="#FFFFFF" aria-hidden="true" version="1.1" viewBox="0 0 580 510.68" xmlns="http://www.w3.org/2000/svg">
     <path d="m125.72 34.375c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" clip-rule="evenodd" fill-rule="evenodd"/>
    </svg>`], { type: 'image/svg+xml' });
    const blueskyIconURL = URL.createObjectURL(blueskyIconBlob);
    blueskyIcon.src = blueskyIconURL;
    blueskyIcon.crossOrigin = "anonymous";

    tiktokIcon = new Image();
    const tiktokIconBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
    <svg clip-rule="evenodd" fill-rule="evenodd" image-rendering="optimizeQuality" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" version="1.1" viewBox="0 0 2859 3333" xmlns="http://www.w3.org/2000/svg">
     <path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z" fill="#fff"/>
    </svg>`], { type: 'image/svg+xml' });
    const tiktokIconURL = URL.createObjectURL(tiktokIconBlob);
    tiktokIcon.src = tiktokIconURL;
    tiktokIcon.crossOrigin = "anonymous";
}

export const SchedulerCanvas = ({ sortedSchedules }) => {
    const [editingAppearance, setEditingAppearance] = useState(false);

    const [bgImageSrc, setBgImageSrc] = useState('/images/tot-bg.jpg');
    const [headerTextHexColor, setHeaderTextHexColor] = useState("#FFFFFF");
    const [bodyTextHexColor, setBodyTextHexColor] = useState("#FFFFFF");
    const [headerTextFont, setHeaderTextFont] = useState("tilt-neon");
    const [bodyTextFont, setBodyTextFont] = useState("tilt-neon");

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const formatDateRange = (startDate, endDate) => {
        const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
        const startDay = startDate.getDate();
        const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
        const endDay = endDate.getDate();
        const year = endDate.getFullYear();

        if (startMonth === endMonth) {
            return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        }
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }

    const formatScheduleImageTimeString = (timeValue) => {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const now = new Date();
        const inputDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Format local time
        const localTime = inputDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: "short", hour12: true });
        const utcTime = inputDate.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric', timeZoneName: "short", hour12: false });

        return `${localTime} / ${utcTime}`;
    }

    const renderFooter = (ctx: CanvasRenderingContext2D, canvas) => {
        const FOOTER_HEIGHT_PX = 96;

        ctx.fillStyle = "#1f1f23DD";
        ctx.beginPath();
        ctx.rect(0, canvas.height - FOOTER_HEIGHT_PX, canvas.width, FOOTER_HEIGHT_PX);
        ctx.fill();

        ctx.fillStyle = "#1f1f23";
        ctx.beginPath();
        ctx.rect(0, canvas.height - (FOOTER_HEIGHT_PX + 1), canvas.width, 1);
        ctx.fill();

        let FOOTER_ICON_PADDING_PX = 24;
        let FOOTER_ICON_WIDTH_PX = 42;
        let FOOTER_ICON_HEIGHT_PX = FOOTER_ICON_WIDTH_PX;
        let FOOTER_ICON_Y_PX = canvas.height - FOOTER_HEIGHT_PX + ((FOOTER_HEIGHT_PX - FOOTER_ICON_HEIGHT_PX) / 2);
        let footerIconX = canvas.width / 2 - (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(tiktokIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);
        footerIconX -= (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(blueskyIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);
        FOOTER_ICON_WIDTH_PX *= 1.5;
        footerIconX -= (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(youTubeIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);
        FOOTER_ICON_WIDTH_PX /= 1.5;
        footerIconX -= (FOOTER_ICON_WIDTH_PX + FOOTER_ICON_PADDING_PX);
        ctx.drawImage(twitchIcon, footerIconX, FOOTER_ICON_Y_PX, FOOTER_ICON_WIDTH_PX, FOOTER_ICON_HEIGHT_PX);

        ctx.fillStyle = bodyTextHexColor;
        ctx.font = `48px ${bodyTextFont}`;
        ctx.fillText("/crispytaytortot", canvas.width / 2, canvas.height - 36);
    }

    const drawBackgroundImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const imgWidth = image.width;
        const imgHeight = image.height;

        // Calculate the scale factor
        const scaleFactorX = canvasWidth / imgWidth;
        const scaleFactorY = canvasHeight / imgHeight;
        const scaleFactor = Math.max(scaleFactorX, scaleFactorY);

        // Calculate the new dimensions and position
        const newWidth = imgWidth * scaleFactor;
        const newHeight = imgHeight * scaleFactor;
        const x = (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        // Clear the canvas and draw the image
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(image, x, y, newWidth, newHeight);
    }


    const renderSchedule = async () => {
        const canvas = document.getElementById('scheduleCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1000;
        canvas.height = 1000;

        ctx.imageSmoothingQuality = "high";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bgImage.complete) {
            drawBackgroundImage(ctx, bgImage);
        } else if (!bgImage.onload) {
            bgImage.onload = renderSchedule;
        }

        renderFooter(ctx, canvas);

        let DAY_RECT_BG_BASE_HEIGHT_PX = 96;
        let DAY_RECT_BG_RADII_PX = DAY_RECT_BG_BASE_HEIGHT_PX / 2;
        let WEEKDAY_TEXT_HEIGHT_PX = 48;
        let DETAILS_TEXT_HEIGHT_PX = 36;

        let textX = 12;
        let textY = 64;
        let text;

        ctx.fillStyle = bodyTextHexColor;
        ctx.font = `bold 56px ${headerTextFont}`;

        if (sortedSchedules.length) {
            let [year, month, date] = sortedSchedules[0].dateString.split('-').map(Number);
            const startDate = new Date(year, month - 1, date);
            [year, month, date] = sortedSchedules[sortedSchedules.length - 1].dateString.split('-').map(Number);
            const endDate = new Date(year, month - 1, date);

            text = formatDateRange(startDate, endDate);
            textX = canvas.width / 2;
            ctx.textAlign = "center";
            ctx.fillStyle = headerTextHexColor;
            ctx.fillText(text, textX, textY);
        }

        ctx.textAlign = "start";

        textY += 32;

        let currentDateString: string = "";

        for (let i = 0; i < sortedSchedules.length; i++) {
            let numCurrentDateStrings;
            textX = 32;
            if (currentDateString !== sortedSchedules[i].dateString) {
                currentDateString = sortedSchedules[i].dateString;
                numCurrentDateStrings = sortedSchedules.filter((s) => { return s.dateString === currentDateString; }).length;

                ctx.fillStyle = "#000000AA";
                ctx.beginPath();
                ctx.roundRect(textX, textY, canvas.width - (2 * textX), DAY_RECT_BG_BASE_HEIGHT_PX + ((numCurrentDateStrings - 1) * 82), DAY_RECT_BG_RADII_PX);
                ctx.fill();

                ctx.font = `${WEEKDAY_TEXT_HEIGHT_PX}px ${bodyTextFont}`;
                textX += DAY_RECT_BG_RADII_PX / 2;
                textY += DAY_RECT_BG_BASE_HEIGHT_PX / 2 + 15;
                ctx.fillStyle = bodyTextHexColor;
                let [year, month, date] = sortedSchedules[i].dateString.split('-').map(Number);
                const d = new Date(year, month - 1, date);
                ctx.fillText(d.toLocaleDateString('en-us', { weekday: 'short' }).toUpperCase(), textX, textY);
                textX += 118;
            } else {
                textX += DAY_RECT_BG_RADII_PX / 2 + 118;
            }

            if (sortedSchedules[i].iconUrl && sortedSchedules[i].game.toLowerCase() !== "off") {
                const img = new Image();
                img.src = sortedSchedules[i].iconUrl;
                img.setAttribute('data-text-x', textX.toString());
                img.setAttribute('data-text-y', (textY - (GAME_ICON_HEIGHT_PX / 4)).toString());
                img.onload = () => {
                    ctx.drawImage(img, parseInt(img.getAttribute('data-text-x') as string), parseInt(img.getAttribute('data-text-y') as string) - (GAME_ICON_HEIGHT_PX / 2), GAME_ICON_WIDTH_PX, GAME_ICON_HEIGHT_PX); // Draw the icon
                };
            }

            textX += GAME_ICON_WIDTH_PX + 12; // Adjust text position to be after the icon (even if there isn't one)

            ctx.font = `${DETAILS_TEXT_HEIGHT_PX}px ${bodyTextFont}`;
            const savedTextY = textY;
            if (sortedSchedules[i].time && sortedSchedules[i].game && sortedSchedules[i].description) {
                textY -= (DETAILS_TEXT_HEIGHT_PX - 13);
                text = formatScheduleImageTimeString(sortedSchedules[i].time);
                ctx.fillText(text, textX, textY);
                textY += DETAILS_TEXT_HEIGHT_PX + 2;
                text = `${sortedSchedules[i].game} - ${sortedSchedules[i].description}`;
                ctx.fillText(text, textX, textY);
            } else if (sortedSchedules[i].time && sortedSchedules[i].game && !sortedSchedules[i].description) {
                textY -= (DETAILS_TEXT_HEIGHT_PX - 13);
                text = formatScheduleImageTimeString(sortedSchedules[i].time);
                ctx.fillText(text, textX, textY);
                textY += DETAILS_TEXT_HEIGHT_PX + 2;
                text = `${sortedSchedules[i].game}`;
                ctx.fillText(text, textX, textY);
            } else if (!sortedSchedules[i].time && sortedSchedules[i].game && sortedSchedules[i].description) {
                textY -= 5;
                text = `${sortedSchedules[i].game} - ${sortedSchedules[i].description}`;
                ctx.fillText(text, textX, textY);
            } else if (!sortedSchedules[i].time && sortedSchedules[i].game && !sortedSchedules[i].description) {
                textY -= 5;
                text = `${sortedSchedules[i].game}`;
                ctx.fillText(text, textX, textY);
            }

            if (sortedSchedules[i + 1] && currentDateString !== sortedSchedules[i + 1].dateString) {
                textY = savedTextY + DAY_RECT_BG_BASE_HEIGHT_PX / 2;
            } else {
                textY = savedTextY + 84;
            }
        }
    };


    const saveCanvasAsImage = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'schedule.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleEditAppearancePanel = () => {
        setEditingAppearance(!editingAppearance);
    }

    const handleBgImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBgImageSrc(imageUrl);
        }
    };

    useEffect(() => {
        bgImage.src = bgImageSrc;
        // renderSchedule();
    }, [bgImageSrc]);

    useEffect(() => {
        renderSchedule();
    }, [sortedSchedules, headerTextHexColor, headerTextFont, bodyTextHexColor, bodyTextFont, bgImageSrc])

    return (
        <div className='flex flex-col gap-2 bg-neutral-800/30 dark:bg-neutral-800/80 p-4 rounded-lg'>
            <div className='relative overflow-clip'>
                <canvas ref={canvasRef} id="scheduleCanvas" className="w-full h-auto aspect-square min-w-64 max-w-[768px] min-h-96 max-h-[50vh]"></canvas>
                <div className={`${editingAppearance ? 'translate-y-0' : 'translate-y-full'} transition-all duration-150 dark:bg-gray-900/90 absolute inset-0 p-2 md:p-4 flex flex-col items-center gap-2`}>
                    <h2 className='text-lg font-semibold'>Editing Schedule Appearance</h2>
                    <div className='w-full grid grid-cols-[1fr_3fr] gap-4'>
                        <label htmlFor="bgImageUpload" className='text-right flex items-center justify-end'>Background Image</label>
                        <div className='flex items-center'>
                            <img
                                className='w-16 h-16 cursor-pointer object-cover'
                                onClick={() => (document.querySelector("#bgImageUpload") as HTMLInputElement)?.click()}
                                src={bgImageSrc}
                            />
                            <input
                                type="file"
                                id="bgImageUpload"
                                accept="image/*"
                                onChange={handleBgImageUpload}
                                className="hidden" // Hide the file input and style it differently if needed
                            />
                        </div>

                        <label className='text-right flex items-center justify-end'>Header Text</label>
                        <div className='flex flex-row gap-2'>
                            <input
                                type="color"
                                id="headerTextHexChanger"
                                onInput={(e) => { setHeaderTextHexColor((e.target as HTMLInputElement).value) }}
                                className="cursor-pointer w-16 h-16 block text-sm text-white"
                            />
                            <input
                                className='block font-mono px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                                type="text"
                                value={headerTextFont}
                                onChange={(e) => { setHeaderTextFont(e.target.value) }} />
                        </div>

                        <label className='text-right flex items-center justify-end'>Body Text</label>
                        <div className='flex flex-row gap-2'>
                            <input
                                type="color"
                                id="bodyTextHexChanger"
                                onInput={(e) => { setBodyTextHexColor((e.target as HTMLInputElement).value) }}
                                className="cursor-pointer w-16 h-16 block text-sm text-white"
                            />
                            <input
                                className='block font-mono px-1.5 py-1 md:px-3 md:py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                                type="text"
                                value={bodyTextFont}
                                onChange={(e) => { setBodyTextFont(e.target.value) }} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-2'>
                <button
                    onClick={saveCanvasAsImage}
                    className="btn-primary"
                >
                    <ArrowDownTrayIcon className='w-5 h-5' />
                    <span>Save as PNG</span>
                </button>
                <button
                    onClick={toggleEditAppearancePanel}
                    className="btn-secondary"
                >
                    {editingAppearance ? <XMarkIcon className='w-5 h-5' /> : <PaintBrushIcon className='w-5 h-5' />}

                    <span>Edit Appearance</span>
                </button>
            </div>
        </div>
    )
}