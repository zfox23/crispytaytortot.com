export let allGames: any;
export const cacheAllOwnedApps = async () => {
    const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_WEB_API_KEY}&steamid=${process.env.STEAM_ID_64_DEC}&format=json&include_appinfo=true`;

    try {
        const appListResponse = await fetch(url);

        // Check if the response is OK (status code 2xx)
        if (!appListResponse.ok) {
            throw new Error(`HTTP error! Status: ${appListResponse.status}`);
        }

        const appListResponseJSON = await appListResponse.json();

        // Ensure that the expected data structure is present
        if (appListResponseJSON && Array.isArray(appListResponseJSON.response?.games)) {
            allGames = appListResponseJSON.response.games;
        } else {
            throw new Error('Unexpected response format from Steam API');
        }
    } catch (error) {
        // Check for specific error codes or messages
        if (error instanceof TypeError && error.message.includes('ENOTFOUND')) {
            console.error(`DNS lookup failed: ${error}`);
        } else if (error instanceof TypeError) {
            console.error(`Type error occurred: ${error}`);
        } else {
            console.error(`Error fetching or processing data from Steam API: ${error}`);
        }
    }
};

