# Real-Time Chat App

A real, working real-time chat app built with **Node.js + Express + Socket.IO**.
Multiple people can open it in their browser and message each other live — actual real-time,
not a simulation, and it doesn't depend on any Claude/AI service to run.

## What's inside

```
realtime-chat-app/
├── package.json      # dependencies + run scripts
├── server.js          # Node/Express server + Socket.IO real-time logic
└── public/
    ├── index.html      # chat UI markup
    ├── style.css        # styling
    └── client.js         # browser-side socket logic
```

## How to run it in VS Code

1. **Unzip the project** and open the `realtime-chat-app` folder in VS Code
   (`File → Open Folder…`).

2. **Open the built-in terminal** in VS Code: `Terminal → New Terminal`
   (or `` Ctrl+` ``).

3. **Install dependencies** (this needs internet access, done once):
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   You should see:
   ```
   Chat server running at http://localhost:3000
   ```

5. **Open the chat**: go to `http://localhost:3000` in your browser.
   Open it in a second tab (or on your phone using your computer's local IP,
   e.g. `http://192.168.x.x:3000`) to see messages sync live between the two.

That's it — no database setup, no API keys.

## Chatting with friends over the internet (not just your own network)

Right now this only works on your own computer/local network. To let friends
elsewhere join, you need to put the server somewhere reachable on the internet.
Easiest free options:

- **[Render](https://render.com)** — connect your GitHub repo, it deploys `npm start` automatically.
- **[Railway](https://railway.app)** — similar one-click Node.js deploy.
- **[Glitch](https://glitch.com)** — paste the code in directly, no GitHub needed.

Push this folder to a GitHub repo first, then connect that repo to whichever
platform you pick — they'll give you a public URL to share with friends.

## Notes on how it works

- **Socket.IO** keeps a live connection open between each browser and the server,
  so messages push instantly instead of the browser having to keep asking "any updates?".
- Message history (last 100 messages) is kept **in server memory** — it resets if
  you restart the server. For permanent history, you'd add a database (e.g. SQLite
  or MongoDB) — ask if you want that added.
- Usernames aren't authenticated — anyone can type any name. Fine for a casual
  chat with friends; not meant for anything sensitive.
