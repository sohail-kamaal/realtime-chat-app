const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve the frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Keep track of who's online: { socketId: username }
const onlineUsers = {};

// In-memory message history (last 100 messages), lost on server restart
const MAX_HISTORY = 100;
let messageHistory = [];

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client tells us their chosen username after connecting
  socket.on('join', (username) => {
    const cleanName = String(username || 'Anonymous').trim().slice(0, 24) || 'Anonymous';
    onlineUsers[socket.id] = cleanName;

    // Send this new user the recent chat history
    socket.emit('history', messageHistory);

    // Let everyone know who's online now
    io.emit('presence', Object.values(onlineUsers));

    // Announce the join to everyone else
    socket.broadcast.emit('system-message', `${cleanName} joined the chat`);
  });

  // A chat message arrives
  socket.on('chat-message', (text) => {
    const username = onlineUsers[socket.id] || 'Anonymous';
    const trimmed = String(text || '').trim().slice(0, 2000);
    if (!trimmed) return;

    const message = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      username,
      text: trimmed,
      timestamp: Date.now(),
    };

    messageHistory.push(message);
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory = messageHistory.slice(-MAX_HISTORY);
    }

    // Broadcast the message to EVERYONE, including the sender
    io.emit('chat-message', message);
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    const username = onlineUsers[socket.id];
    if (!username) return;
    socket.broadcast.emit('typing', { username, isTyping });
  });

  socket.on('disconnect', () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit('presence', Object.values(onlineUsers));
    if (username) {
      socket.broadcast.emit('system-message', `${username} left the chat`);
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
