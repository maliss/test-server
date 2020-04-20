import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { HelixService } from './helix.service';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

// gameIds: ["460630", "497078", "506274"],

const configuration = {
    gameIds: ["460630","497078", "506274"],
    cliendId: "pi33v9pxjkhip7946othx0vyx6o03a"
}

const helixService = new HelixService;
helixService.start(server, configuration.gameIds, configuration.cliendId);

//start our server
server.listen(process.env.PORT || 8999, () => {
    const { port } = server.address() as WebSocket.AddressInfo;
    console.log(`Server started on port ${port} :)`);
});