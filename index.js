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
const wss = new WebSocket.Server({ server });

const port = 5000; // Change if needed

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send live time every second
  const interval = setInterval(() => {
    const currentTime = new Date().toISOString();
    ws.send(JSON.stringify({ time: currentTime })); // Send current time to client
  }, 1000);

  // Clean up on disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`WebSocket server running at ws://localhost:${port}`);
});

