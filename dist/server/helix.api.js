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
const axios_1 = require("axios");
const delay = (interval) => new Promise(resolve => setTimeout(resolve, interval));
// Twitch max number of request per minute
const maxNumberRequestPerMinute = 30;
// Number in millisecond between fetch
const delayBetweenFetch = (60 * 1000) / maxNumberRequestPerMinute;
// Recursive function to manage twitch api pagination
exports.fetchingHelix = (gameId, clientId, cursor, data = []) => __awaiter(void 0, void 0, void 0, function* () {
    yield delay(delayBetweenFetch);
    const helix = axios_1.default.create({
        baseURL: 'https://api.twitch.tv/helix',
        headers: { 'Client-ID': clientId }
    });
    const numberOfDateByRequest = 100;
    return helix.get(`/streams?first=${numberOfDateByRequest}&game_id=${gameId}` + (cursor ? `&after=${cursor}` : '')).then((response) => {
        data.push(...response.data.data);
        if (response.data.data.length < numberOfDateByRequest) {
            return data;
        }
        return exports.fetchingHelix(gameId, clientId, response.data.pagination.cursor, data);
    }).catch(err => {
        return Promise.reject(err);
    });
});
// Fetch game data
exports.fetchingHelixGameData = (gameId, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    yield delay(delayBetweenFetch);
    const helix = axios_1.default.create({
        baseURL: 'https://api.twitch.tv/helix',
        headers: { 'Client-ID': clientId }
    });
    return helix.get(`/games?id=${gameId}`).then((response) => {
        return response.data.data;
    }).catch(err => {
        console.log('err', err);
    });
});
//# sourceMappingURL=helix.api.js.map