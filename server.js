const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {
    room1: [],
    room2: [],
    room3: []
};

app.use(express.static('public')); // Sert les fichiers statiques (HTML, CSS, JS)

io.on('connection', (socket) => {
    console.log('Un joueur est connecté.');

    // Lorsque le joueur choisit une room
    socket.on('joinRoom', (room) => {
        if (rooms[room].length < 2) {
            rooms[room].push(socket.id); // Ajouter le joueur à la room
            socket.join(room); // Le joueur rejoint la room
            socket.emit('roomJoined', room);

            if (rooms[room].length === 2) {
                io.to(room).emit('startGame', 'Les deux joueurs sont prêts !');
            }
        } else {
            socket.emit('roomFull', 'La room est déjà pleine.');
        }
    });

    // Lorsqu'un joueur effectue un mouvement
    socket.on('makeMove', (data) => {
        const { room, move, player } = data;
        io.to(room).emit('moveMade', { move, player });
    });

    // Lorsqu'un joueur se déconnecte
    socket.on('disconnect', () => {
        // Retirer le joueur de la room
        for (let room in rooms) {
            const index = rooms[room].indexOf(socket.id);
            if (index !== -1) {
                rooms[room].splice(index, 1);
                io.to(room).emit('playerLeft', `Un joueur a quitté ${room}.`);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});