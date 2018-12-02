const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const {AddressInfo} = require('net');

const app = express();
app.use('/', express.static('./'));
//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, connectReq) => {

    console.log("new client connected ")
    ws.isAlive = true;
    ws.fdlink = new FdLink();

    ws.on('pong', () => {
        ws.isAlive = true;
    });


    //connection is up, let's add a simple simple event
    ws.on('message', content => {

        let message;
        try {
            message = JSON.parse(content);
        } catch(e) {
            ws.send(content);
            return;
        }

        ws.send(message)

    })

    //send immediatly a feedback to the incoming connection
    ws.send('{"retCode":1000000,"msg": "welcome msg"}')

    ws.on('error', (err) => {
        console.warn(`Client disconnected - reason: `, err);
    })
});

setInterval(() => {
    wss.clients.forEach((ws) => {

        if (!ws.isAlive) {
            console.log('detected a client hearbeat failed')
            //return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);

//start our server
server.listen(process.env.PORT || 80, () => {
    console.log(`Server started on [` + server.address().address + ']:' + server.address().port);
});