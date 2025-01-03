import express from 'express';
import { allGames } from './steam';
const steamRouter = express.Router();

const imageToBase64 = async (url: string) => {
    try {
        // Fetch the image as an ArrayBuffer
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert the buffer to a Base64 string
        const base64String = buffer.toString('base64');

        // Get the content type from the headers
        const contentType = response.headers.get('content-type');

        return `data:${contentType};base64,${base64String}`;
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
}

// Endpoint to search for a game and get its App ID
steamRouter.get('/search-game', async (req, res) => {
    const { gameName } = req.query;
    if (!gameName) {
        return res.status(400).json({ error: 'Query parameter "gameName" is required' });
    }

    try {
        const appInfo = allGames.find((game: any) => {
            return game.name === gameName;
        });

        if (!appInfo) {
            return res.status(404).json({ error: 'Game details not found' });
        }

        // Construct the icon URL
        const iconUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${appInfo.appid}/${appInfo.img_icon_url}.jpg`;

        // Construct the data URL
        const dataUrl = await imageToBase64(iconUrl);

        res.json({ iconUrl: dataUrl });
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default steamRouter;
