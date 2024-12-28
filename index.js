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

// First WebSocket server
const wss1 = new WebSocket.Server({ noServer: true });
wss1.on("connection", (ws) => {
  console.log("Client connected to WebSocket 1");

  const interval = setInterval(() => {
    const randomNumber = Math.floor(Math.random() * 10); // Generate random number 0-9
    ws.send(JSON.stringify({ randomNumber }));
  }, 100); // Send continuously

  ws.on("close", () => {
    clearInterval(interval);
    console.log("WebSocket 1 client disconnected");
  });
});

// Second WebSocket server
const wss2 = new WebSocket.Server({ noServer: true });
wss2.on("connection", (ws) => {
  console.log("Client connected to WebSocket 2");

  const interval = setInterval(() => {
    const randomAlphabet = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Generate random alphabet (A-Z)
    ws.send(JSON.stringify({ randomAlphabet }));
  }, 1000); // Send every second

  ws.on("close", () => {
    clearInterval(interval);
    console.log("WebSocket 2 client disconnected");
  });
});

// Route the WebSocket connection to the correct WebSocket server
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url;

  if (pathname === "/ws1") {
    wss1.handleUpgrade(request, socket, head, (ws) => {
      wss1.emit("connection", ws, request);
    });
  } else if (pathname === "/ws2") {
    wss2.handleUpgrade(request, socket, head, (ws) => {
      wss2.emit("connection", ws, request);
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


