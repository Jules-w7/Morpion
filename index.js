// Import des modules
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const sessionHandler = require('./public/sessionHandler.js');
const mqtt = require('mqtt');  // Add this line to import the mqtt library

// Create the express application
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Define the folder where all the site documents are located
app.use(express.static('public'));

// Define the port on which the server will open
const port = 3000;

const connectedPlayers = new Map();
let currentPlayer = null; // Variable to track the current player

// Middleware for session management
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.set('socketio', io);

// Create an MQTT client
const mqttBroker = 'mqtt://localhost:1883';  // Replace with your MQTT broker's address
const mqttClient = mqtt.connect(mqttBroker);
const mqttTopic = 'gameplay_moves';

// Define which document will be opened first
app.get('/', (req, res) => {
  res.redirect(path.join(__dirname, 'public', 'html', 'home.html'));
});

// Handle the "/playervsplayer" page with the sessionHandler
app.get('/playervsplayer', sessionHandler);

app.get('/gameplay.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'Jsgameplay.js'));
});

app.get('/Botgameplay.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'Botgameplay.js'));
});

// Handle user connections and disconnections with Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('setPlayerName', (playerName) => {
        connectedPlayers.set(socket.id, playerName);
        io.emit('updatePlayerList', Array.from(connectedPlayers.values()));
        console.log(`Number of connected users: ${connectedPlayers.size}`);
        if (connectedPlayers.size === 2) {
            // Start the game when both players are connected
            startGame();
        }
    });

    // Function to start the game
    function startGame() {
        const playerIds = Array.from(connectedPlayers.keys());
        currentPlayer = playerIds[0]; // Set the first player as the current player
        io.to(currentPlayer).emit('yourTurn'); // Inform the first player that it's their turn
    }

    // Handle the 'playerMove' event
    socket.on('playerMove', ({ indexgrid, convertionSymbole, action }) => {
        if (socket.id === currentPlayer) {
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

            // Handle the "disableCell" action
            if (action === 'disableCell') {
                // Broadcast the 'disableCell' event to all clients
                io.emit('disableCell', indexgrid);
            }

            socket.on('playerWin', ({ playerName, jeuActif }) => {
                console.log(`Player ${playerName} has won!`);
                // Emit to all clients, not just the one who triggered the event
                io.emit('playerWin', { playerName, jeuActif });
            });    
        
            socket.on('gameTie', ({ jeuActif }) => {
                console.log(`The game is a tie`);
                // Emit to all clients, not just the one who triggered the event
                io.emit('gameTie', { jeuActif });
            }); 

            // Switch turns
            currentPlayer = currentPlayer === Array.from(connectedPlayers.keys())[0] ? Array.from(connectedPlayers.keys())[1] : Array.from(connectedPlayers.keys())[0];
            io.to(currentPlayer).emit('yourTurn'); // Inform the next player that it's their turn
        }
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

    socket.on('aiMoveIndex', ({ aiMoveIndex, convertionSymbole}) => {
        console.log(`${aiMoveIndex}.${convertionSymbole}`);

        const mqttMessage = `${aiMoveIndex}.${convertionSymbole}`;
        mqttClient.publish(mqttTopic, mqttMessage, (err) => {
            if (err) {
                console.error('Failed to send MQTT message:', err);
            } else {
                console.log('MQTT message sent successfully:', mqttMessage);
            }
        });
    })

    socket.on('playerMoveIndex', ({ indexgrid, convertionSymbole}) => {
        console.log(`${indexgrid}.${convertionSymbole}`);

        const mqttMessage = `${indexgrid}.${convertionSymbole}`;
        mqttClient.publish(mqttTopic, mqttMessage, (err) => {
            if (err) {
                console.error('Failed to send MQTT message:', err);
            } else {
                console.log('MQTT message sent successfully:', mqttMessage);
            }
        });
    })

    socket.on('restartMatrix', () => {
        let message = "0.4";
        console.log(message);
        
        const mqttMessage = message;
        mqttClient.publish(mqttTopic, mqttMessage, (err) => {
            if (err) {
                console.error('Failed to send MQTT message:', err);
            } else {
                console.log('MQTT message sent successfully:', mqttMessage);
            }
        });
    })
});

// Start the server
server.listen(port, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
