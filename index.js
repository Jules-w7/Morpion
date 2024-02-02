const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const sessionHandler = require('./public/sessionHandler.js'); 

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

const connectedPlayers = new Map();

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/public/index.html');
});

app.get('/playervsplayer', sessionHandler);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setPlayerName', (playerName) => {
    connectedPlayers.set(socket.id, playerName);
    io.emit('updatePlayerList', Array.from(connectedPlayers.values()));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');

    connectedPlayers.delete(socket.id);
    io.emit('updatePlayerList', Array.from(connectedPlayers.values()));
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});