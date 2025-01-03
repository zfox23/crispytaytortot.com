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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const steam_1 = require("./steam");
const steamRouter = express_1.default.Router();
const imageToBase64 = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the image as an ArrayBuffer
        const response = yield fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const arrayBuffer = yield response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Convert the buffer to a Base64 string
        const base64String = buffer.toString('base64');
        // Get the content type from the headers
        const contentType = response.headers.get('content-type');
        return `data:${contentType};base64,${base64String}`;
    }
    catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
});
// Endpoint to search for a game and get its App ID
steamRouter.get('/search-game', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { gameName } = req.query;
    if (!gameName) {
        return res.status(400).json({ error: 'Query parameter "gameName" is required' });
    }
    try {
        const appInfo = steam_1.allGames.find((game) => {
            return game.name === gameName;
        });
        if (!appInfo) {
            return res.status(404).json({ error: 'Game details not found' });
        }
        // Construct the icon URL
        const iconUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${appInfo.appid}/${appInfo.img_icon_url}.jpg`;
        // Construct the data URL
        const dataUrl = yield imageToBase64(iconUrl);
        res.json({ iconUrl: dataUrl });
    }
    catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = steamRouter;
