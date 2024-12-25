const socket = io();

let username = '';
let gameId = null;

document.getElementById('game-container').style.display = 'none';

// Fonction pour rejoindre une partie
function joinGame() {
    username = document.getElementById('username').value;
    if (username.trim() === '') {
        alert('Please enter a valid username');
        return;
    }
    socket.emit('joinGame', { username });
    document.getElementById('username-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
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

// Écouteur pour afficher le chat
socket.on('chatMessage', (data) => {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<p><strong>${data.username}: </strong>${data.message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Faites défiler jusqu'en bas
});

// Recevoir des notifications sur le statut du jeu
socket.on('gameStatus', (status) => {
    document.getElementById('game-status').innerHTML = status;
});
