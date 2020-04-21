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
const api = require("./helix.api");
const WebSocket = require("ws");
const tooManyRequestDelay = 60000;
class HelixService {
    constructor() {
        this.statistics = {};
        this.clientId = "";
        this.active = false;
        this.newStatistics = (gameId) => {
            return {
                gameId,
                name: "",
                viewCount: 0,
                boxArt: "",
                numberStreamers: 0
            };
        };
        // Initialise all games
        this.initStatistics = (gameIds) => {
            this.statistics = {};
            gameIds.forEach((gameId) => {
                this.statistics[gameId] = this.newStatistics(gameId);
            });
        };
        // Wait for all games to finish to restart the loop
        this.initHelixFetch = () => __awaiter(this, void 0, void 0, function* () {
            const gameIds = Object.keys(this.statistics);
            const delay = (interval) => new Promise(resolve => setTimeout(resolve, interval));
            while (this.active) {
                for (let i = 0; i < gameIds.length; i++) {
                    yield this.fetchSingleHelixData(gameIds[i]).then((gameData) => {
                        this.statistics[gameIds[i]].viewCount = gameData.viewCounts;
                        this.statistics[gameIds[i]].numberStreamers = gameData.steamerCount;
                        this.sendStatistic(this.statistics[gameIds[i]]);
                    }).catch((err) => __awaiter(this, void 0, void 0, function* () {
                        if (err.response.data.status === 429) {
                            // Too many request
                            yield delay(tooManyRequestDelay);
                        }
                        return;
                    }));
                }
            }
        });
        // Fetch a single game
        this.fetchSingleHelixData = (gameId) => {
            return api.fetchingHelix(gameId, this.clientId, '').then(data => {
                const viewCounts = data.reduce((totalViewCount, stream) => {
                    return totalViewCount + stream.viewer_count;
                }, 0);
                return {
                    steamerCount: data.length,
                    viewCounts
                };
            });
        };
        // Broadcast data for a single game
        this.sendStatistic = (statistic) => {
            this.wss.clients.forEach((ws) => {
                ws.send(JSON.stringify(statistic));
            });
        };
        // Start websocket and initialise / fetch
        this.start = (server, gameIds, clientId) => {
            this.clientId = clientId;
            this.active = true;
            this.initStatistics(gameIds);
            this.fetchGameData(gameIds);
            this.initHelixFetch();
            this.wss = new WebSocket.Server({ server });
        };
        // Fetch information about the game : name and box_art_url
        this.fetchGameData = (gameIds) => {
            Promise.all(gameIds.map(gameId => {
                return api.fetchingHelixGameData(gameId, this.clientId);
            })).then((games) => {
                games.forEach((game) => {
                    this.statistics[game[0].id].name = game[0].name;
                    this.statistics[game[0].id].boxArt = game[0].box_art_url;
                });
            });
        };
    }
    fetchHelixData(arg0) {
        throw new Error("Method not implemented.");
    }
}
exports.HelixService = HelixService;
//# sourceMappingURL=helix.service.js.map