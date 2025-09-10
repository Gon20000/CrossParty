# CrossParty

A multiplayer twist on the classic Tic Tac Toe! 🎉  
Host a server, invite your friends, and battle it out in fast-paced matches.

Lightweight, fun, and built to be easy for anyone to set up and play.

---

## 🚀 Installation

Make sure you’re using **Node.js v24.6** for best compatibility.  

Clone the repo and install dependencies:

```bash
git clone https://github.com/Gon20000/CrossParty.git
cd CrossParty
npm install
```

---

## 🎮 Client

Run the client to join a game:

```bash
npm start
```

⚠️ Make sure to edit the client’s URL to match the one the server host gives you!

---

## 🖥️ Server

Start the server with:

```bash
npm run server
```

You’ll likely need tunneling so friends outside your network can join.  
You can use **Cloudflare Tunnel**, **ngrok**, or **localtunnel**.  

Example:

```bash
npm run server
cloudflared tunnel --url http://localhost:5050
```

Then share the generated link with other players.

---

## 📱 Termux Support (Android)

Want to host or play from your phone?  
We provide a helper script for **Termux users** that:

- Downloads this repository
- Installs Node.js v24
- Sets up the client
- Runs everything directly in Termux the first time (for subsequent runs, use `npm start`)

You can run it easily with:

```bash
curl -fsSL https://raw.githubusercontent.com/Gon20000/CrossParty/main/termux_setup.sh | bash
```

Perfect for quick mobile matches. 📱✨

---

## 🎥 Demo

Below is a short video showing gameplay:



https://github.com/user-attachments/assets/ed0cb62e-f7f1-4811-8918-9b8e8eeee142


---

## 📝 License

This project is licensed under the **MIT License** — feel free to use, share, and play around with it.


