"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheAllOwnedApps = exports.allGames = void 0;
const cacheAllOwnedApps = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_WEB_API_KEY}&steamid=${process.env.STEAM_ID_64_DEC}&format=json&include_appinfo=true`;
    const appListResponse = yield fetch(url);
    const appListResponseJSON = yield appListResponse.json();
    exports.allGames = appListResponseJSON.response.games;
});
exports.cacheAllOwnedApps = cacheAllOwnedApps;
