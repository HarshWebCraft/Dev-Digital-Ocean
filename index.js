// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const app = express();
// const http = require("http");
// const server = http.createServer(app);
// require("dotenv").config();

// const corsOptions = {
//   origin: "*",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   optionsSuccessStatus: 204,
// };
// const port = process.env.port || 5000
// app.use(cors(corsOptions));

// app.get("/server/test", async (req, res) => {
//   res.json("hello world");
// });

// app.use(bodyParser.json());


// app.listen(port, () => {
//   console.log("http://localhost:5000");
// });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// WebSocket Server 1 (Random Alphabets)
const wss1 = new WebSocket.Server({ noServer: true });

// Broadcast the same random alphabet to all clients in wss1
const broadcastRandomAlphabet = () => {
  const randomData = {
    char: String.fromCharCode(65 + Math.floor(Math.random() * 26)), // Random alphabet (A-Z)
    timestamp: new Date().toISOString(),
  };

  wss1.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(randomData));
    }
  });
};

// WebSocket Server 2 (Random Numbers)
const wss2 = new WebSocket.Server({ noServer: true });

// Broadcast the same random number to all clients in wss2
const broadcastRandomNumber = () => {
  const randomData = {
    number: Math.floor(Math.random() * 100), // Random number between 0 and 99
    timestamp: new Date().toISOString(),
  };

  wss2.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(randomData));
    }
  });
};

// Start intervals for broadcasting
setInterval(broadcastRandomAlphabet, 1000); // Broadcast to WebSocket 1 every second
setInterval(broadcastRandomNumber, 2000); // Broadcast to WebSocket 2 every 2 seconds

// Handle WebSocket connections
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url;

  if (pathname === "/ws1") {
    wss1.handleUpgrade(request, socket, head, (ws) => {
      wss1.emit("connection", ws, request);
      console.log("Client connected to WebSocket 1");
    });
  } else if (pathname === "/ws2") {
    wss2.handleUpgrade(request, socket, head, (ws) => {
      wss2.emit("connection", ws, request);
      console.log("Client connected to WebSocket 2");
    });
  } else {
    socket.destroy();
  }
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`WebSocket 1 available at ws://0.0.0.0:${port}/ws1`);
  console.log(`WebSocket 2 available at ws://0.0.0.0:${port}/ws2`);
});

