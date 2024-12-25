const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let games = {}; // Dictionnaire pour stocker les informations des jeux actifs

// Quand un joueur se connecte
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Quand un joueur rejoint un jeu
    socket.on('joinGame', (data) => {
        const { username } = data;
        console.log(`${username} joined the game`);

        // Créer une nouvelle partie si nécessaire
        let gameId;
        for (let id in games) {
            if (games[id].players.length < 2) {
                gameId = id;
                break;
            }
        }

        // Si aucune partie n'existe, crée une nouvelle partie
        if (!gameId) {
            gameId = `${Date.now()}`; // Crée un identifiant unique pour la partie
            games[gameId] = {
                players: [],
                chat: []
            };
        }

        // Ajouter le joueur à la partie
        games[gameId].players.push({ username, id: socket.id });

        // S'il y a 2 joueurs, la partie commence
        if (games[gameId].players.length === 2) {
            io.to(games[gameId].players[0].id).emit('gameStatus', 'Game starting!');
            io.to(games[gameId].players[1].id).emit('gameStatus', 'Game starting!');
        }

        // Envoie l'ID du jeu au joueur
        socket.emit('gameStatus', `Welcome ${username}! You are in game ${gameId}`);
        socket.join(gameId);
        socket.emit('gameStatus', `Game ID: ${gameId}`);

        // Gérer le chat
        socket.on('chatMessage', (data) => {
            const { message, gameId, username } = data;
            if (games[gameId]) {
                games[gameId].chat.push({ username, message });
                io.to(gameId).emit('chatMessage', { username, message });
            }
        });
    });

    // Quand un joueur se déconnecte
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        for (let gameId in games) {
            games[gameId].players = games[gameId].players.filter(player => player.id !== socket.id);
            if (games[gameId].players.length === 0) {
                delete games[gameId];
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
