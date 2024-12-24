const WebSocket = require("ws");
const http = require("http");
const PaperTrade = require("./PaperTrade");
const setupWebSocket = require("./websocket");

let openTrades = [];
const clients = []; // To track connected WebSocket clients

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running\n");
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");
  clients.push(ws);

  ws.on("close", () => {
    console.log("Client disconnected");
    const index = clients.indexOf(ws);
    if (index > -1) clients.splice(index, 1);
  });
});

// Broadcast data to all connected WebSocket clients
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Function to open a new trade using the order object
const placeOrder = (order) => {
  const trade = new PaperTrade(order);
  openTrades.push(trade);
  console.log(
    `Open order created for ${order.side} ${order.symbol} with entry price ${
      order.limit_price || "market price"
    }`
  );

  setupWebSocket(order.symbol, handlePriceUpdate);

  return trade;
};

function handlePriceUpdate(symbol, spotPrice, closeWebsocket) {
  console.log(`Latest Spot Price for ${symbol}: ${spotPrice} $`);

  openTrades.forEach((trade) => {
    if (trade.symbol === symbol && trade.isOpen) {
      trade.checkEntryCondition(spotPrice);

      if (trade.isPlaced) {
        trade.calculatePnL(spotPrice);
        console.log(
          `Running P&L for ${trade.side} trade: ${trade.runningPnL} $`
        );

        // Broadcast running P&L to WebSocket clients
        broadcast({
          symbol: trade.symbol,
          side: trade.side,
          runningPnL: trade.runningPnL,
        });

        trade.checkExitConditions(spotPrice, closeWebsocket);

        openTrades = openTrades.filter((t) => t.isOpen);
      }
    }
  });
}

// Start the HTTP and WebSocket server on port 5000
server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

module.exports = { placeOrder, openTrades };
