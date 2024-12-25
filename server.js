const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {}; // Structure pour stocker les joueurs et les salles.

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    console.log('New player connected.');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'joinRoom') {
            const roomId = data.roomId;

            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }

            if (rooms[roomId].length < 2) {
                rooms[roomId].push(ws);
                ws.roomId = roomId;

                // Notify all players in the room
                rooms[roomId].forEach(client => {
                    client.send(JSON.stringify({
                        type: 'playerJoined',
                        players: rooms[roomId].length
                    }));
                });

                // Start game when 2 players are connected
                if (rooms[roomId].length === 2) {
                    rooms[roomId].forEach(client => {
                        client.send(JSON.stringify({ type: 'startGame' }));
                    });
                }
            } else {
                ws.send(JSON.stringify({ type: 'roomFull' }));
            }
        } else if (data.type === 'move') {
            const roomId = ws.roomId;

            if (roomId && rooms[roomId]) {
                rooms[roomId].forEach(client => {
                    if (client !== ws) {
                        client.send(JSON.stringify({
                            type: 'move',
                            index: data.index,
                            player: data.player
                        }));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        const roomId = ws.roomId;

        if (roomId && rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(client => client !== ws);

            // Notify remaining players in the room
            rooms[roomId].forEach(client => {
                client.send(JSON.stringify({ type: 'playerLeft' }));
            });

            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
        }
    });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
