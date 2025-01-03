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
exports.startTwitch = exports.setViewershipData = exports.getLast30Days = void 0;
const path_1 = __importDefault(require("path"));
const twitch_auth_1 = require("./twitch-auth");
const twitch_1 = require("./twitch");
const SQLite = require("better-sqlite3");
const viewersSQL = new SQLite(path_1.default.join(__dirname, "..", "..", "db", "viewers.sqlite"));
const prepareSQLite = () => {
    // Check if the table "viewers" exists.
    const viewersTable = viewersSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'viewers';").get();
    if (!viewersTable['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        viewersSQL.prepare("CREATE TABLE viewers (id INTEGER PRIMARY KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, viewerCount INTEGER, channelIsLive INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        viewersSQL.prepare("CREATE UNIQUE INDEX idx_viewers_id ON viewers (id);").run();
        viewersSQL.pragma("synchronous = 1");
        viewersSQL.pragma("journal_mode = wal");
    }
    exports.getLast30Days = viewersSQL.prepare("SELECT * FROM viewers WHERE timestamp > DATETIME('now', '-30 day')");
    exports.setViewershipData = viewersSQL.prepare("INSERT OR REPLACE INTO viewers (viewerCount, channelIsLive) VALUES (@viewerCount, @channelIsLive);");
};
const startTwitch = () => {
    console.log("Preparing SQLite tables and statements...");
    prepareSQLite();
    console.log("Prepared!");
    const getViewerCountCallback = () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, twitch_auth_1.refreshTwitchUserAccessToken)();
        let streamsInfo = yield (0, twitch_1.getStreams)();
        let viewerCount = 0;
        let channelIsLive = 0;
        if (streamsInfo.ok && streamsInfo.streamsInfoJSON.data.length > 0) {
            viewerCount = streamsInfo.streamsInfoJSON.data[0].viewer_count;
            channelIsLive = 1;
        }
        else if (!streamsInfo.ok) {
            console.warn(JSON.stringify(streamsInfo));
        }
        let statement = {
            viewerCount: viewerCount,
            channelIsLive: channelIsLive
        };
        exports.setViewershipData.run(statement);
    });
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        getViewerCountCallback();
    }), parseInt(process.env.TWITCH_GET_VIEWER_COUNT_INTERVAL_MS || '900000'));
    getViewerCountCallback();
};
exports.startTwitch = startTwitch;
