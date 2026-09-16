const socket = io();

const joinScreen = document.getElementById('joinScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');

const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const userList = document.getElementById('userList');
const onlineCount = document.getElementById('onlineCount');
const typingIndicator = document.getElementById('typingIndicator');

let myUsername = '';
let typingTimeout = null;

function joinChat() {
  const name = usernameInput.value.trim();
  if (!name) {
    usernameInput.focus();
    return;
  }
  myUsername = name;
  socket.emit('join', name);
  joinScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  messageInput.focus();
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinChat();
});

function addMessage(msg) {
  const div = document.createElement('div');
  const isMine = msg.username === myUsername;
  div.className = 'msg' + (isMine ? ' mine' : '');

  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  div.innerHTML = `
    <div class="meta"><strong>${escapeHtml(msg.username)}</strong> · ${time}</div>
    <div class="text"></div>
  `;
  div.querySelector('.text').textContent = msg.text;

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('chat-message', text);
  messageInput.value = '';
  socket.emit('typing', false);
});

let isTyping = false;
messageInput.addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing', true);
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit('typing', false);
  }, 1500);
});

// --- Socket event listeners ---

socket.on('history', (history) => {
  messagesEl.innerHTML = '';
  history.forEach(addMessage);
});

socket.on('chat-message', (msg) => {
  addMessage(msg);
});

socket.on('system-message', (text) => {
  addSystemMessage(text);
});

socket.on('presence', (usernames) => {
  onlineCount.textContent = `${usernames.length} online`;
  userList.innerHTML = '';
  usernames.forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    userList.appendChild(li);
  });
});

socket.on('typing', ({ username, isTyping }) => {
  typingIndicator.textContent = isTyping ? `${username} is typing…` : '';
});
