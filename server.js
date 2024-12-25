const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let playersInRooms = {
    room1: [],
    room2: [],
    room3: []
};
let usernames = new Set(); // Garder la trace des noms d'utilisateurs pris

// Quand un joueur se connecte
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Vérification de l'unicité du nom d'utilisateur
    socket.on('checkUsername', (username) => {
        if (usernames.has(username)) {
            socket.emit('userAvailable', false);
        } else {
            usernames.add(username);
            socket.emit('userAvailable', true);
        }
    });

    // Quand un joueur rejoint un jeu
    socket.on('joinGame', (data) => {
        const { username, room } = data;

        if (playersInRooms[room].length < 2) {
            playersInRooms[room].push({ username, id: socket.id });
            socket.join(room);

            // Démarrer le jeu lorsque 2 joueurs sont dans la salle
            if (playersInRooms[room].length === 2) {
                io.to(room).emit('gameStatus', `Game starting in ${room}!`);
            }

            // Envoyer le statut du jeu au joueur
            socket.emit('gameStatus', `Welcome ${username}! You are in ${room}`);
        } else {
            socket.emit('gameStatus', 'This room is full. Please wait for a new game.');
        }
    });

    // Gestion du chat
    socket.on('chatMessage', (data) => {
        const { message, room, username } = data;
        io.to(room).emit('chatMessage', { username, message });
    });

    // Quand un joueur se déconnecte
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Supprimer l'utilisateur des salles et des noms d'utilisateur
        for (let room in playersInRooms) {
            playersInRooms[room] = playersInRooms[room].filter(player => player.id !== socket.id);
        }
        usernames.forEach((user, index) => {
            if (user === socket.id) {
                usernames.delete(user);
            }
        });
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
