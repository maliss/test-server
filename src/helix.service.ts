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

    public initFetch = async () => {
        const gameIds = Object.keys(this.statistics);

        while(this.active) {
            for (let i = 0; i < gameIds.length; i++) {
                await this.fetchTwitchData(gameIds[i]);
            }
        }
    }

    public fetchTwitchData = (gameId: string) : Promise<any> => {
        const delay = (interval: any) => new Promise(resolve => setTimeout(resolve, interval));
        return api.fetchingHelix(gameId, this.clientId, '').then(data => {
                
            const viewCounts = data.reduce((totalViewCount: number, stream: any) => {
                return totalViewCount + stream.viewer_count
            }, 0);
            
            this.statistics[gameId].viewCount = viewCounts;
            this.statistics[gameId].numberStreamers = data.length;

            this.sendStatistic(this.statistics[gameId]);

            console.log('sendStatistic', gameId, viewCounts);

            return Promise.resolve();
            
        }).catch(async err => {
            if(err.response.data.status === 429) {
                console.log('Too many request');
                await delay(tooManyRequestDelay);
            }
            return;
        });
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

        this.initFetch();
        
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', this.onConnection);
     
    }

    public onConnection = (ws: WebSocket) => {
        ws.send(JSON.stringify(this.statistics));
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

