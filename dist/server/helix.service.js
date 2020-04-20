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
        this.fetch = () => __awaiter(this, void 0, void 0, function* () {
            const gameIds = Object.keys(this.statistics);
            const delay = (interval) => new Promise(resolve => setTimeout(resolve, interval));
            while (this.active) {
                for (let i = 0; i < gameIds.length; i++) {
                    // await delay(refreshGameDelay);
                    yield this.fetchTwitchData(gameIds[i]);
                }
            }
        });
        this.fetchTwitchData = (gameId) => {
            const delay = (interval) => new Promise(resolve => setTimeout(resolve, interval));
            return this.fetchingHelix(gameId, this.clientId).then(data => {
                const viewCounts = data.reduce((totalViewCount, stream) => {
                    return totalViewCount + stream.viewer_count;
                }, 0);
                this.statistics[gameId].viewCount = viewCounts;
                this.statistics[gameId].numberStreamers = data.length;
                console.log('sendStatistic', gameId, viewCounts);
                this.sendStatistic(this.statistics[gameId]);
            }).catch((err) => __awaiter(this, void 0, void 0, function* () {
                if (err.response.data.status === 429) {
                    console.log('Too many request');
                    yield delay(tooManyRequestDelay);
                }
                return;
            }));
        };
        this.updateStatistics = () => {
            const gameIds = Object.keys(this.statistics);
            /*
            Promise.all(gameIds.map(gameId => {
                return this.fetchingHelix(gameId, this.clientId).then(res => {
                    // console.log("gameId", gameId);
                    // console.log('res', res);
                    
                    const viewCounts = res.reduce((totalViewCount: number, stream: any) => {
                        return totalViewCount + stream.viewer_count
                    }, 0);
                    this.statistics[gameId].viewCount = viewCounts;
                    
                });
            })).then(() => {
                console.log('sendToAll');
                this.sendToAll();
                this.updateStatistics();
            });*/
            /*
            gameIds.forEach(async gameId => {
                while(this.active) {
                    const timeStart = moment();
                    await this.fetchingHelix(gameId, this.clientId).then(data => {
                        const viewCounts = data.reduce((totalViewCount: number, stream: any) => {
                            return totalViewCount + stream.viewer_count
                        }, 0);
                        this.statistics[gameId].viewCount = viewCounts;
                        
                    }).then(() => {
                        console.log('sendToAll', gameId);
                        this.sendStatistic(this.statistics[gameId]);
                        // this.updateStatistics();
                    });
    
                    const timeDiff = moment().diff(timeStart);
                    console.log('timeDiff', timeDiff, gameId);
                }
            });
            */
            /*
           const limiter = new Bottleneck({
                maxConcurrent: 1,
                minTime: 3000
            });
            */
            /*
            Promise.all(gameIds.map(async gameId => {
                return await this.fetchingHelix(gameId, this.clientId).then(res => {
                    
                    const viewCounts = res.reduce((totalViewCount: number, stream: any) => {
                        return totalViewCount + stream.viewer_count
                    }, 0);
                    this.statistics[gameId].viewCount = viewCounts;
    
                    console.log('sendStatistic', gameId);
                    this.sendStatistic(this.statistics[gameId]);
                    
                });
            })).then(() => {
                console.log('updateStatistics');
                this.updateStatistics();
            });
            */
            gameIds.reduce((previousPromise, gameId) => __awaiter(this, void 0, void 0, function* () {
                yield previousPromise;
                return yield this.fetchingHelix(gameId, this.clientId).then(res => {
                    const viewCounts = res.reduce((totalViewCount, stream) => {
                        return totalViewCount + stream.viewer_count;
                    }, 0);
                    this.statistics[gameId].viewCount = viewCounts;
                    console.log('sendStatistic', gameId, viewCounts);
                    this.sendStatistic(this.statistics[gameId]);
                }).catch(err => {
                    if (err.response.data.status === 429) {
                        console.log('Too many request');
                    }
                });
            }), Promise.resolve()).then(res => {
                console.log('updateStatistics');
                this.active = true;
                // this.updateStatistics();
            });
        };
        this.stop = () => {
            this.active = false;
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
            console.log('gameIds', gameIds);
            //this.updateStatistics();
            this.fetch();
            // setInterval(this.updateStatistics, 300000);
            this.wss = new WebSocket.Server({ server });
            this.wss.on('connection', this.onConnection);
        };
        this.onConnection = (ws) => {
            // ws.send(JSON.stringify(this.statistics));
        };
        this.fetchingHelix = (gameId, clientId) => {
            return api.fetchingHelix(gameId, clientId, "");
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