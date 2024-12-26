const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let board = Array(9).fill(null);
let currentPlayer = 'X';

io.on('connection', (socket) => {
  if (players.length >= 2) {
    socket.emit('message', 'La salle est pleine comme ta mams.');
    return socket.disconnect();
  }

  players.push(socket.id);
  socket.emit('message', `Bienvenue Cher Fils de Pute ! Vous êtes le joueur ${players.length === 1 ? 'X' : 'O'}.`);
  socket.emit('board', { board, currentPlayer });

  socket.on('play', (index) => {
    if (socket.id !== players[0] && currentPlayer === 'X') return;
    if (socket.id !== players[1] && currentPlayer === 'O') return;
    if (board[index] || !players.includes(socket.id)) return;

    board[index] = currentPlayer;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    io.emit('board', { board, currentPlayer });

    const winner = checkWinner();
    if (winner) {
      io.emit('message', `Le joueur ${winner} a gagné !`);
      resetGame();
    } else if (board.every((cell) => cell !== null)) {
      io.emit('message', 'Match nul !');
      resetGame();
    }
  });

  socket.on('disconnect', () => {
    players = players.filter((id) => id !== socket.id);
    resetGame();
    io.emit('message', 'le fdp s\'est déconnecté. La partie a été réinitialisée.');
  });
});

function checkWinner() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  io.emit('board', { board, currentPlayer });
}

app.use(express.static('public'));

server.listen(3000, () => {
  console.log('Serveur en cours d\'exécution sur http://localhost:3000');
});
