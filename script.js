const socket = io();

let username = '';
let gameId = null;
let availableRooms = ['room1', 'room2', 'room3']; // Trois salles disponibles
let playersInRooms = {
    room1: [],
    room2: [],
    room3: []
};

document.getElementById('game-container').style.display = 'none';

// Fonction pour rejoindre une partie
function joinGame() {
    username = document.getElementById('username').value.trim();
    if (username === '') {
        alert('Please enter a valid username');
        return;
    }
    
    // Vérifier si le nom d'utilisateur est déjà pris
    socket.emit('checkUsername', username);
}

// Fonction pour envoyer un message dans le chat
function sendChat(event) {
    if (event.key === 'Enter') {
        const message = document.getElementById('chat-input').value;
        if (message.trim()) {
            socket.emit('chatMessage', { message, gameId, username });
            document.getElementById('chat-input').value = '';
        }
    }
}

// Affichage des messages du chat
socket.on('chatMessage', (data) => {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<p><strong>${data.username}: </strong>${data.message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Faites défiler jusqu'en bas
});

// Affichage du statut du jeu
socket.on('gameStatus', (status) => {
    document.getElementById('game-status').innerHTML = status;
});

// Liste des utilisateurs disponibles
socket.on('userAvailable', (available) => {
    if (available) {
        // Créer une nouvelle partie ou rejoindre une partie existante
        let room = availableRooms.find(room => playersInRooms[room].length < 2);
        if (room) {
            socket.emit('joinGame', { username, room });
        } else {
            alert('No rooms available at the moment.');
        }
    } else {
        alert('Username already taken. Please choose another one.');
    }
});
