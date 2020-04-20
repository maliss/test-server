import axios from "axios";

const delay = (interval: any) => new Promise(resolve => setTimeout(resolve, interval));

export const fetchingHelix = async (gameId: string, clientId: string, cursor: string, data: any = []) : Promise<any> => {
    
   await delay(2000);
    
    const helix = axios.create({
        baseURL: 'https://api.twitch.tv/helix',
        headers: {'Client-ID': clientId}
    });

    const numberOfDateByRequest = 100;
    
    return helix.get(`/streams?first=${numberOfDateByRequest}&game_id=${gameId}` + (cursor ? `&after=${cursor}` : '')).then( (response: any) => {
        data.push(...response.data.data);
        
        if (response.data.data.length < numberOfDateByRequest ) {  
            return data
        }
        
        return fetchingHelix(gameId, clientId, response.data.pagination.cursor, data);
    }).catch(err => {
        return Promise.reject(err);
    });

}

export const fetchingHelixGameData = async (gameId: string, clientId: string) : Promise<any> => {
    
    await delay(2000);
    
    const helix = axios.create({
        baseURL: 'https://api.twitch.tv/helix',
        headers: {'Client-ID': clientId}
    });
    
    return helix.get(`/games?id=${gameId}`).then( (response: any) => {
        return response.data.data;
    }).catch(err => {
        console.log('err', err);
    });

}
