const axios = require("axios");
const moment = require("moment");
const schedule = require("node-schedule");
const { placeOrder } = require("../paper trade/placeOrder.js");
const WebSocket = require("ws");

// Define user input
const candleTime = "11:00";
const timeFrame = "30m";
const symbol = "BTCUSD";
const quantity = 10;
const stop_loss_point = 300;
const take_profit_point = 300;

const strategy = () => {
  function toUnixTimestamp(dateStr, format = "YYYY-MM-DD HH:mm:ss") {
    return moment(dateStr, format).unix();
  }

  function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  // Function to calculate the next run time for the scheduler based on candle time and time frame
  function calculateNextRunTime(candleTime, timeFrame) {
    const now = moment();
    const today = now.format("YYYY-MM-DD");
    const initialCandleTime = moment(
      `${today} ${candleTime}`,
      "YYYY-MM-DD HH:mm"
    );

    const timeValue = parseInt(timeFrame.slice(0, -1));
    const timeUnit = timeFrame.slice(-1);

    // Calculate the next candle time
    let nextCandleTime = initialCandleTime;
    if (timeUnit === "m") {
      nextCandleTime = nextCandleTime.add(timeValue, "minutes");
    } else if (timeUnit === "h") {
      nextCandleTime = nextCandleTime.add(timeValue, "hours");
    } else {
      throw new Error(
        "Invalid time frame. Use 'm' for minutes or 'h' for hours."
      );
    }

    // If the next candle time has already passed today, set it for the same time tomorrow
    if (now.isAfter(nextCandleTime)) {
      nextCandleTime.add(1, "day");
    }

    return nextCandleTime;
  }

  // Function to fetch OHLC data for the specified candle time and store high and low in variables
  async function fetchOhlcData() {
    const today = moment().format("YYYY-MM-DD");
    const startTime = `${today} ${candleTime}:00`;

    // Calculate end time based on time frame
    const startTimeMoment = moment(startTime, "YYYY-MM-DD HH:mm:ss");
    const timeValue = parseInt(timeFrame.slice(0, -1));
    let endTimeMoment;

    if (timeFrame.endsWith("m")) {
      endTimeMoment = startTimeMoment.clone().add(timeValue, "minutes");
    } else if (timeFrame.endsWith("h")) {
      endTimeMoment = startTimeMoment.clone().add(timeValue, "hours");
    } else {
      throw new Error("Invalid time frame format");
    }

    const startUnix = toUnixTimestamp(startTime);
    const endUnix = toUnixTimestamp(
      endTimeMoment.format("YYYY-MM-DD HH:mm:ss")
    );

    console.log(startUnix);
    console.log(endUnix);
    // Fetch OHLC data from the API
    try {
      await sleep(1);
      const response = await axios.get(
        "https://api.india.delta.exchange/v2/history/candles",
        {
          headers: { Accept: "application/json" },
          params: {
            resolution: timeFrame,
            symbol: symbol,
            start: startUnix,
            end: endUnix,
          },
        }
      );

      const candles = response.data.result || [];
      if (candles.length > 0) {
        const highPrice = parseFloat(candles[0].high);
        const lowPrice = parseFloat(candles[0].low);
        console.log(`Fetched OHLC Data - High: ${highPrice}, Low: ${lowPrice}`);
        EntryAlert(symbol, highPrice, lowPrice);
      } else {
        console.log("No data available for the specified time range.");
        fetchOhlcData();
      }
    } catch (error) {
      console.error("Error fetching OHLC data:", error.message);
    }
  }

  // Calculate the next run time and schedule the task
  const nextRunTime = calculateNextRunTime(candleTime, timeFrame);
  console.log(`Scheduling Strategy 1 at ${nextRunTime.format("HH:mm")} `);

  schedule.scheduleJob(nextRunTime.toDate(), () => {
    fetchOhlcData();

    // Reschedule for the same time tomorrow
    schedule.scheduleJob(nextRunTime.add(1, "day").toDate(), fetchOhlcData);
  });

  //------------------------------------------------------------------------------------------------------------------------------------//

  // Import the WebSocket library

  // Delta Exchange WebSocket URL
  const WS_URL = "wss://socket.india.delta.exchange";

  // Subscription message to subscribe to BTCUSD ticker

  // Function to connect to the WebSocket and receive spot price data
  function EntryAlert(symbol, buyEntry, sellEntry) {
    // Create a new WebSocket connection

    // console.log(SVGSymbolElement)

    const subscribeMessage = JSON.stringify({
      type: "subscribe",
      payload: {
        channels: [{ name: "candlestick_1m", symbols: [symbol] }],
      },
    });

    const ws = new WebSocket(WS_URL);

    // Event listener: Triggered when the WebSocket connection is opened
    ws.on("open", () => {
      console.log("Connected to WebSocket.");
      // Send the subscription message after connection is established
      ws.send(subscribeMessage);
    });

    // Event listener: Triggered whenever a message is received from the WebSocket
    ws.on("message", (message) => {
      try {
        // Parse the incoming message as JSON
        const data = JSON.parse(message);
        // console.log(data);
        // Extract 'symbol' and 'spot_price' if available
        const symbol = data.symbol;
        const spotPrice = data.close;

        // Print 'symbol' and 'spot_price' if they exist
        if (symbol && spotPrice) {
          console.log(`${symbol} : ${spotPrice}`);

          if (buyEntry < spotPrice) {
            console.log("------ buy alert ------");
            placeOrder({
              symbol: symbol,
              size: quantity,
              side: "buy",
              order_type: "market_order",
              // "limit_price": "59000",
              take_profit_point: take_profit_point,
              stop_loss_point: stop_loss_point,
              strategy: "67208287a8f7ff08c36e54d2",
              defaultSpreadsheetId:
                "1vbuZ-VwVzJAN-QYgNBYsVQ10De9B0tz8AQIqxuwkjc4",
            });
            ws.close();
          }
          if (sellEntry > spotPrice) {
            console.log("------ sell alert ------");
            ws.close();
            placeOrder({
              symbol: symbol,
              size: quantity,
              side: "sell",
              order_type: "market_order",
              // "limit_price": "59000",
              take_profit_point: take_profit_point,
              stop_loss_point: stop_loss_point,
              strategy: "67208287a8f7ff08c36e54d2",
              defaultSpreadsheetId:
                "1vbuZ-VwVzJAN-QYgNBYsVQ10De9B0tz8AQIqxuwkjc4",
            });
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    // Event listener: Handles WebSocket errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Event listener: Triggered when the WebSocket connection is closed
    ws.on("close", () => {
      console.log("WebSocket connection closed.");
    });
  }
};

// strategy();

module.exports = strategy;
