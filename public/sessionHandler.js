const path = require('path');

module.exports = (req, res) => {
  const io = req.app.get('socketio'); // Assuming you set socket.io in your express app

  // Check if the maximum number of players is reached
  const connectedPlayers = Array.from(io.sockets.sockets.values());
  if (connectedPlayers.length >= 2) {
    res.status(400).send('Session is full');
    return;
  }

  const playerName = req.query.playerName; // Assuming you send the playerName as a query parameter

  req.session.player = playerName;

  // Emit a message to all clients when a new player joins
  io.emit('playerJoined', { player: playerName });

  res.sendFile(path.join(__dirname, '/html/playervsplayer.html'));

  // Listen for the disconnect event
  req.on('disconnect', () => {
    // Handle disconnect event, remove user from the active player list, etc.
    console.log(`${playerName} disconnected`);

    // Emit a message to all clients when a player disconnects
    io.emit('playerDisconnected', { player: playerName });
  });
};
