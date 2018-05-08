const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const channelBotPre = 'Channel bot: ';

let nicks = [];
function addNick(nick) {
  nicks.push(nick);
}
function removeNick(nick) {
  var index = nicks.indexOf(nick);
  if (index > -1) {
    nicks.splice(index, 1);
  }
}
function renameNick(oldNick, newNick) {
  removeNick(oldNick);
  addNick(newNick);
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  if (!socket.name) socket.name = socket.id;
  addNick(socket.name);
  io.emit('channel message', channelBotPre + socket.name + ' connects. Welcome, type \'/nick user\' to change name.');
  socket.on('disconnect', function () {
    removeNick(socket.name);
    io.emit('channel message', channelBotPre + socket.name + ' disconnects.');
  });
  socket.on('chat message', function (msg) {
    if (msg.substring(0, 5) === '/nick') {
      let newName = msg.split(" ")[1];
      io.emit('channel message', channelBotPre + socket.name + ' is now ' + newName);
      renameNick(socket.name, newName);
      socket.name = newName;
    }
    else if (msg.substring(0, 4) === '/who') {
      io.emit('channel message', channelBotPre + 'in channel: ' + nicks.join(','));
    } else if (msg.substring(0, 5) === '/help') {
      io.emit('channel message', channelBotPre + '/help /who /nick');
    } else {
      io.emit('chat message', socket.name + ": " + msg);
    }
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
