const path = require('path');

module.exports = (req, res) => {
  if (!req.session.player) {
    req.session.player = 'Player1';
  } else if (req.session.player === 'Player1') {
    req.session.player = 'Player2';
  } else {
    res.send('Game is full');
    return;
  }

  res.sendFile(path.join(__dirname, '/html/playervsplayer.html'));
};