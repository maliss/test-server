"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class HelixServices {
    constructor() {
        this.fetchingHelix = () => {
            const helix = axios_1.default.create({
                baseURL: 'https://api.twitch.tv/helix',
                headers: { 'Client-ID': "pi33v9pxjkhip7946othx0vyx6o03a" }
            });
            return helix.get('/streams?game_id=460630').then((response) => {
                return response.data;
            });
        };
    }
}
exports.HelixServices = HelixServices;
//# sourceMappingURL=helix.services.js.map