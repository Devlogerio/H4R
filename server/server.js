//https://trello.com/b/HUfWD39P/dynamic-digital-twin
// Libraries
const WebSocketServer = require('ws');
const http = require('http');
const https = require('https');

const express = require('express');
const path = require('path');
const { title } = require('process');
const { json, response } = require('express');
const geo = require('geolib');
const { randomInt } = require('crypto');
//Starting the server
const serverPath = path.join(__dirname);
const publicPath = path.join(__dirname, '../client');
const app = express();

const server = http.createServer(app);
server.listen(process.env.PORT || 2000, () => {
    console.log(`Server is up on port ${server.address().port}, ${process.env.PORT}`);
});

app.use(express.json());
app.use(express.static(publicPath));


// Main class
class Main {
    constructor() {
        this.disconnectDelay = 5000; // milliseconds
        this.everySecond = 1000;
        this.wss = new WebSocketServer.Server({ server });
        this.wss.broadcast = (data) => wss.clients.forEach(client => client.send(data))
    }

    runWebsocket = () => {
        this.wss.on('connection', ws => {
            console.log('Someone connected...');
            ws.role =  "Unknown";
            ws.dbUserId =  "Unknown";
            //keepAlive system
            ws.keepOnline = () => {
                ws.onlineTimer = setTimeout(() => {
                    console.log('Someone disconnected');
                    ws.close();
                }, this.disconnectDelay)
            }

            ws.on('message', data => {
                // try {
                    var jsonData;
                    try {
                        jsonData = JSON.parse(data.toString())
                    } catch (e) {
                        //console.log(e);
                        try {
                            var b = Buffer.from(data);
                            jsonData = JSON.parse(b.toString());
                        }
                        catch (ee) {
                            console.log(ee);
                            console.log(data);
                            return;
                        }
                    }

                    if (!jsonData) return
                    if(!jsonData.title || !jsonData.data) return
                    //keepAlive system
                    if (jsonData.title == "imOnline") {
                        clearTimeout(ws.onlineTimer);
                        ws.keepOnline();
                    } else {
                        //console.log(jsonData)
                    }
                    if (jsonData.title === "login") {
                        console.log("Login");
                    }
                    if (jsonData.title == "myLocation" ) {
                        let lat = jsonData.data.latitude
                        let long = jsonData.data.longitude
                        var distance = geo.getDistance(
                             {latitude:35.68628769234591  , longitude:51.37062268665011 } ,
                             {latitude:lat , longitude : long }
                            )
                        
                        ws.send(JSON.stringify({title:'distance' , data : distance}))
                    }

                    if(jsonData.title === "sendMeDummyRequest") {
                        var ddd = "write me a sentence about " + randomInt(1, 15) + " cats";
                        ws.send(JSON.stringify({title : "virtualAssist" , data : ddd}))
                    }

                    if(jsonData.title === "AskAI") {
                        this.wss.clients.forEach(function each(client) {
                            client.send(JSON.stringify({title: "virtualAssist" , data:jsonData.data}));
                            console.log("The question is: ", jsonData.data)
                        });
                    }

                    // if(jsonData.title === "virtualAssist") {
                    //     this.wss.clients.forEach(function each(client) {
                    //         client.send(JSON.stringify({title: "tempResponseBroadcastTest" , data:jsonData.data}));
                    //     });
                    //     console.log("AI Response: ", jsonData.data)
                    // }
            })
        })
    }

    init = () => {
        this.runWebsocket()
        
        setInterval(() => {
            this.wss.clients.forEach(function each(client) {
                client.send(JSON.stringify({title: "pingMe" , data:{}}));
              });
        } , 3000)

    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
  }


const main = new Main();
main.init();










