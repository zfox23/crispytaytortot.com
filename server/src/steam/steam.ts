export let allGames: any;
export const cacheAllOwnedApps = async () => {
    const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_WEB_API_KEY}&steamid=${process.env.STEAM_ID_64_DEC}&format=json&include_appinfo=true`;
    const appListResponse = await fetch(url);
    const appListResponseJSON = await appListResponse.json();
    allGames = appListResponseJSON.response.games;
}
