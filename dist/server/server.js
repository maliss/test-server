"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const helix_service_1 = require("./helix.service");
const app = express();
//initialize a simple http server
const server = http.createServer(app);
// gameIds: ["460630", "497078", "506274"],
const configuration = {
    gameIds: ["460630", "497078", "506274"],
    cliendId: "pi33v9pxjkhip7946othx0vyx6o03a"
};
const helixService = new helix_service_1.HelixService();
helixService.start(server, configuration.gameIds, configuration.cliendId);
//start our server
server.listen(process.env.PORT || 8999, () => {
    const { port } = server.address();
    console.log(`Server started on port ${port} :)`);
});
//# sourceMappingURL=server.js.map