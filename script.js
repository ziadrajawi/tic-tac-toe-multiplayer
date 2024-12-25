const socket = io();
let currentRoom = null;
let player = 'X'; // Par défaut, le joueur 1 est 'X'

// Rejoindre une room
function joinRoom(room) {
    currentRoom = room;
    socket.emit('joinRoom', room);
    
    // Afficher un message de statut
    document.getElementById('game-status').innerText = `Vous avez rejoint ${room}. En attente de l'autre joueur...`;
    
    socket.on('roomJoined', (room) => {
        document.getElementById('game-status').innerText = `Bienvenue dans ${room}! Attendez que l'autre joueur rejoigne...`;
        document.getElementById('game-board').style.display = 'block'; // Afficher le tableau de jeu
    });

    socket.on('roomFull', (message) => {
        alert(message);
    });

    socket.on('startGame', (message) => {
        document.getElementById('game-status').innerText = message;
    });

    socket.on('moveMade', (data) => {
        const { move, player } = data;
        updateBoard(move, player);
    });

    socket.on('playerLeft', (message) => {
        document.getElementById('game-status').innerText = message;
    });
}

// Mettre à jour le tableau de jeu après un mouvement
function updateBoard(move, player) {
    const cell = document.getElementById('cell-' + move);
    cell.innerText = player;
}

// Gérer un clic sur une case du tableau
function makeMove(move) {
    if (!currentRoom) return;

    // Envoyer le mouvement au serveur
    socket.emit('makeMove', { room: currentRoom, move: move, player: player });
}

// Créer dynamiquement les cases du tableau de Tic Tac Toe
const board = document.getElementById('board');
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = 'cell-' + i; // L'ID de chaque case
    cell.onclick = () => makeMove(i); // Lorsqu'on clique sur une case, faire un mouvement
    board.appendChild(cell);
}
