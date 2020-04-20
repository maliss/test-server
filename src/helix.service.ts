import axios from "axios";
import * as api from "./helix.api";
import * as WebSocket from 'ws';
import * as http from 'http';

interface IStatistic {
    gameId: string;
    name: string;
    viewCount: number;
    boxArt: string;
    numberStreamers: number;
}

type StatisticsKeys = { [key: string]: IStatistic };

const tooManyRequestDelay = 60000;

export class HelixService {

    private statistics: StatisticsKeys = {};
    private clientId: string = "";
    private wss: any | undefined;
    private active: boolean = false;

    private newStatistics = (gameId: string) : IStatistic => {
        return {
            gameId,
            name: "",
            viewCount: 0,
            boxArt: "",
            numberStreamers: 0
        }
    }

    public initStatistics = (gameIds: string[]) => {
        this.statistics = {};
        gameIds.forEach((gameId: string) => {
            this.statistics[gameId] = this.newStatistics(gameId)
        });
    }

    public fetch = async () => {
        const gameIds = Object.keys(this.statistics);
        const delay = (interval: any) => new Promise(resolve => setTimeout(resolve, interval));

        while(this.active) {
            for (let i = 0; i < gameIds.length; i++) {
                // await delay(refreshGameDelay);
                await this.fetchTwitchData(gameIds[i]);
            }
            
        }

    }

    public fetchTwitchData = (gameId: string) : Promise<any> => {
        const delay = (interval: any) => new Promise(resolve => setTimeout(resolve, interval));
        return this.fetchingHelix(gameId, this.clientId).then(data => {
                
            const viewCounts = data.reduce((totalViewCount: number, stream: any) => {
                return totalViewCount + stream.viewer_count
            }, 0);
            this.statistics[gameId].viewCount = viewCounts;
            this.statistics[gameId].numberStreamers = data.length;

            console.log('sendStatistic', gameId, viewCounts);
            this.sendStatistic(this.statistics[gameId]);
            
        }).catch(async err => {
            if(err.response.data.status === 429) {
                console.log('Too many request');
                await delay(tooManyRequestDelay);
            }
            return;
        });
    }

    public updateStatistics = () => {
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
        
     
        gameIds.reduce( async (previousPromise, gameId) => {
            await previousPromise;
            return await this.fetchingHelix(gameId, this.clientId).then(res => {
                    
                const viewCounts = res.reduce((totalViewCount: number, stream: any) => {
                    return totalViewCount + stream.viewer_count
                }, 0);
                this.statistics[gameId].viewCount = viewCounts;

                console.log('sendStatistic', gameId, viewCounts);
                this.sendStatistic(this.statistics[gameId]);
                
            }).catch(err => {
                if(err.response.data.status === 429) {
                    console.log('Too many request')
                }
            });
        }, Promise.resolve()).then(res => {
                console.log('updateStatistics');
                this.active = true;
                // this.updateStatistics();
        });
        
    }

    private stop = () => {
        this.active = false;
    }

    private sendStatistic = (statistic: IStatistic) => {
        this.wss.clients.forEach((ws: any) => {
            ws.send(JSON.stringify(statistic));
        });
    }

    public start = (server: http.Server, gameIds: string[], clientId: string) => {

        this.clientId = clientId;
        this.active = true;

        this.initStatistics(gameIds);

        this.fetchGameData(gameIds);

        console.log('gameIds',gameIds);

        //this.updateStatistics();
        this.fetch();

        // setInterval(this.updateStatistics, 300000);
        
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', this.onConnection);
     
    }

    public onConnection = (ws: WebSocket) => {
        // ws.send(JSON.stringify(this.statistics));
    }

    public fetchingHelix = (gameId: string, clientId: string) : Promise<any> => {
        return api.fetchingHelix(gameId,clientId, "");
    }

    public fetchGameData = (gameIds: string[]) => {
        Promise.all(gameIds.map(gameId => {
            return api.fetchingHelixGameData(gameId, this.clientId);
        })).then((games) => {
            games.forEach((game: any) => {
                this.statistics[game[0].id].name = game[0].name;
                this.statistics[game[0].id].boxArt = game[0].box_art_url;
            });
        })
    }
}

