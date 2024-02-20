// Import des modules
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const sessionHandler = require('./public/sessionHandler.js');
const mqtt = require('mqtt');  // Add this line to import the mqtt library

// Créer l'application grâce à express
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Définir le dossier où se trouvent tous les documents du site
app.use(express.static('public'));

// Définir le port sur lequel le serveur va s'ouvrir
const port = 4000;

const connectedPlayers = new Map();

// Middleware pour la gestion des sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.set('socketio', io);

// Create an MQTT client
const mqttBroker = 'mqtt://localhost';  // Replace with your MQTT broker's address
const mqttClient = mqtt.connect(mqttBroker);
const mqttTopic = 'gameplay_moves';

// Définir quelle document va être ouvert en premier
app.get('/', (req, res) => {
  res.redirect('/public/index.html');
});

// Gestion de la page "/playervsplayer" avec le sessionHandler
app.get('/playervsplayer', sessionHandler);

app.get('/gameplay.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'Jsgameplay.js'));
});

// Gestion des connexions et déconnexions des utilisateurs avec Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('setPlayerName', (playerName) => {
        connectedPlayers.set(socket.id, playerName);
        io.emit('updatePlayerList', Array.from(connectedPlayers.values()));
        console.log(`Number of connected users: ${connectedPlayers.size}`);
    });

    // Handle the 'playerMove' event
    socket.on('playerMove', ({ indexgrid, convertionSymbole }) => {
        console.log(`${indexgrid}.${convertionSymbole}`);

        // Publish MQTT message with indexgrid and convertionSymbole
        const mqttMessage = `${indexgrid}.${convertionSymbole}`;
        mqttClient.publish(mqttTopic, mqttMessage, (err) => {
            if (err) {
                console.error('Failed to send MQTT message:', err);
            } else {
                console.log('MQTT message sent successfully:', mqttMessage);
            }
        });

        // Broadcast the player move to all clients except the sender
        socket.broadcast.emit('updateGame', { indexgrid, convertionSymbole });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');

        if (connectedPlayers.has(socket.id)) {
            const playerName = connectedPlayers.get(socket.id);
            connectedPlayers.delete(socket.id);
            io.emit('updatePlayerList', Array.from(connectedPlayers.values()));
            console.log(`Number of connected users: ${connectedPlayers.size}`);

            if (socket.request.session && socket.request.session.playerName) {
                delete socket.request.session.playerName;
                console.log(`Player "${playerName}" removed from session`);
            }
        }
    });
});

// Démarrer le serveur
server.listen(port, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
