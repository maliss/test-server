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
    fetchHelixData(arg0: string): any {
        throw new Error("Method not implemented.");
    }

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

    // Initialise all games
    public initStatistics = (gameIds: string[]) => {
        this.statistics = {};
        gameIds.forEach((gameId: string) => {
            this.statistics[gameId] = this.newStatistics(gameId)
        });
    }

    // Wait for all games to finish to restart the loop
    public initHelixFetch = async () => {
        const gameIds = Object.keys(this.statistics);
        const delay = (interval: any) => new Promise(resolve => setTimeout(resolve, interval));

        while(this.active) {
            for (let i = 0; i < gameIds.length; i++) {
                await this.fetchSingleHelixData(gameIds[i]).then((gameData) => {
                    this.statistics[gameIds[i]].viewCount = gameData.viewCounts;
                    this.statistics[gameIds[i]].numberStreamers = gameData.steamerCount;

                    this.sendStatistic(this.statistics[gameIds[i]]);

                }).catch(async err => {
                    if(err.response.data.status === 429) {
                        // Too many request
                        await delay(tooManyRequestDelay);
                    }
                    return;
                });
            }
        }
    }

    // Fetch a single game
    public fetchSingleHelixData = (gameId: string) : Promise<any> => {
        return api.fetchingHelix(gameId, this.clientId, '').then(data => {
                
            const viewCounts = data.reduce((totalViewCount: number, stream: any) => {
                return totalViewCount + stream.viewer_count
            }, 0);
            
            return {
                steamerCount: data.length,
                viewCounts
            }
            
        });
    }

    // Broadcast data for a single game
    private sendStatistic = (statistic: IStatistic) => {
        this.wss.clients.forEach((ws: any) => {
            ws.send(JSON.stringify(statistic));
        });
    }

    // Start websocket and initialise / fetch
    public start = (server: http.Server, gameIds: string[], clientId: string) => {

        this.clientId = clientId;
        this.active = true;

        this.initStatistics(gameIds);

        this.fetchGameData(gameIds);

        this.initHelixFetch();
        
        this.wss = new WebSocket.Server({ server });
     
    }

    // Fetch information about the game : name and box_art_url
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

