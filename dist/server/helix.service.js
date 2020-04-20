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
        this.initStatistics = (gameIds) => {
            this.statistics = {};
            gameIds.forEach((gameId) => {
                this.statistics[gameId] = this.newStatistics(gameId);
            });
        };
        this.initFetch = () => __awaiter(this, void 0, void 0, function* () {
            const gameIds = Object.keys(this.statistics);
            while (this.active) {
                for (let i = 0; i < gameIds.length; i++) {
                    yield this.fetchTwitchData(gameIds[i]).then((gameData) => {
                        this.statistics[gameIds[i]].viewCount = gameData.viewCounts;
                        this.statistics[gameIds[i]].numberStreamers = gameData.steamerCount;
                        this.sendStatistic(this.statistics[gameIds[i]]);
                        console.log('sendStatistic', gameIds[i], gameData.viewCounts);
                    });
                }
            }
        });
        this.fetchTwitchData = (gameId) => {
            const delay = (interval) => new Promise(resolve => setTimeout(resolve, interval));
            return api.fetchingHelix(gameId, this.clientId, '').then(data => {
                const viewCounts = data.reduce((totalViewCount, stream) => {
                    return totalViewCount + stream.viewer_count;
                }, 0);
                return {
                    steamerCount: data.length,
                    viewCounts
                };
            }).catch((err) => __awaiter(this, void 0, void 0, function* () {
                if (err.response.data.status === 429) {
                    console.log('Too many request');
                    yield delay(tooManyRequestDelay);
                }
                return;
            }));
        };
        this.sendStatistic = (statistic) => {
            this.wss.clients.forEach((ws) => {
                ws.send(JSON.stringify(statistic));
            });
        };
        this.start = (server, gameIds, clientId) => {
            this.clientId = clientId;
            this.active = true;
            this.initStatistics(gameIds);
            this.fetchGameData(gameIds);
            this.initFetch();
            this.wss = new WebSocket.Server({ server });
            this.wss.on('connection', this.onConnection);
        };
        this.onConnection = (ws) => {
            // ws.send(JSON.stringify(this.statistics));
        };
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
}
exports.HelixService = HelixService;
//# sourceMappingURL=helix.service.js.map