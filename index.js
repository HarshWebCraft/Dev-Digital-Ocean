const config = require("./configs/keys");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const speakeasy = require("speakeasy");
const http = require("http");
let web_socket; // Declare the WebSocket instance globally
let wss; // Declare the WebSocket server instance globally
const server = http.createServer(app);

const BrokerSchema = require("./models/users");
const signup = require("./routes/signup");
const signin = require("./routes/signin");
const addbroker = require("./routes/addbroker");
const checkBroker = require("./routes/checkBroker");
const deleteBroker = require("./routes/deleteBroker");
const userInfo = require("./routes/userInfo");
const dbschema = require("./routes/dbschema");
const removeClient = require("./routes/removeClient");
const verifyemail = require("./routes/verifyemail");
const wbSocket = require("./websocket/wbLiveData");
const getSymbole = require("./websocket/getSymbol");
const saveUserData = require("./saveUserData");
const axios = require("axios");
const { WebSocket } = require("ws");
const strategy_1 = require("./routes/strategy_1");
const addExcelData = require("./createExcel/createExcel");
const resetPassword = require("./routes/resetPassword");
const forgetPassword = require("./routes/forgetPassword");
const tour = require("./routes/tour");
const addMyStra = require("./routes/addToWallet");
const removeMyStra = require("./routes/removeMyStra");
const addDeployed = require("./routes/addDeployed");
const removeDeployed = require("./routes/removeDeployed");
const checkLink = require("./routes/checkLink");
const mobileno = require("./routes/mobileno");
const profile = require("./routes/profile");
const updateprofile = require("./routes/updateprofile");
const navbar = require("./routes/navbar");
const addToWallet = require("./routes/addToWallet");
const verifypayment = require("./routes/verifypayment");
const newamount = require("./routes/newamount");
const mystartegies = require("./routes/mystartegies");
const subscribe = require("./routes/subscribe");
const addMarketPlaceData = require("./routes/addMarketPlaceData.js");
const getMarketPlace = require("./routes/getMarketPlace.js");
const updateSubscribe = require("./routes/updateSubscribe.js");

require("./models/users");
app.use(cors());
app.get("/server/test", (req, res) => {
  res.json("hello world 2 " + Date.now());
});
app.use(bodyParser.json());

mongoose
  .connect(`${config.MongoUrl}`)
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((e) => {
    console.log("Error is " + e);
  });

const port = process.env.port || 5000;

app.post("/signup", signup);
app.post("/signin", signin);
app.post("/addbroker", addbroker);
app.post("/checkBroker", checkBroker);
app.post("/deleteBroker", deleteBroker);
app.post("/userinfo", userInfo);
app.post("/dbschema", dbschema);
app.post("/removeClient", removeClient);
app.post("/verify-email", verifyemail);
app.post("/wbSocket", wbSocket);
app.post("/getSymbol", getSymbole);
app.post("/verifyemail", verifyemail);
app.post("/add-excel-data", addExcelData);
app.post("/resetPassword", resetPassword);
app.post("/forgetPassword", forgetPassword);
app.post("/tour", tour);
app.post("/addmystra", addMyStra);
app.post("/removeMyStra", removeMyStra);
app.post("/addDeployed", addDeployed);
app.post("/removeDeployed", removeDeployed);
app.post("/checkLink", checkLink);
app.post("/mobileno", mobileno);
app.post("/profile", profile);
app.post("/updateprofile", updateprofile);
app.post("/navbar", navbar);
app.post("/addtowallet", addToWallet);
app.post("/verify-payment", verifypayment);
app.post("/newamount", newamount);
app.post("/myStrategies", mystartegies);
app.post("/subscribe", subscribe);
app.post("/addMarketPlaceData", addMarketPlaceData);
app.post("/getMarketPlaceData", getMarketPlace);
app.post("/updateSubscribe", updateSubscribe);

app.get("/start", (req, res) => {
  getPreviousData()
    .then(() => res.send("Data fetched successfully"))
    .catch((error) => {
      console.log("Error fetching data:", error);
      res.status(500).send("Error fetching data");
    });
});

app.get("/close", (req, res) => {
  if (web_socket) {
    web_socket.close();
    console.log("WebSocket connection closed");
    res.send("WebSocket connection closed");
  } else {
    res.status(400).send("No WebSocket connection to close");
  }
});

app.listen(port, () => {
  console.log("http://localhost:5000");
});

// --------------------------------------------------------------------------------------------------------------------- //

// Start the HTTP server

// Constants for login credentials and API keys
const secretKey = "UUGDXH753M4H5FS5HJVIGBSSSU";
const clientcode = "R51644670";
const password = "3250";
const apiKey = "xL9TyAO8";
const privateKey = "xL9TyAO8";

// Function to get previous day's data
const getPreviousData = async () => {
  const totpCode = speakeasy.totp({
    secret: secretKey,
    encoding: "base32",
  });

  const data = JSON.stringify({
    clientcode: clientcode,
    password: password,
    totp: `${totpCode}`,
  });

  const config = {
    method: "post",
    url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "192.168.43.238",
      "X-ClientPublicIP": "106.193.147.98",
      "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
      "X-PrivateKey": privateKey,
    },
    data: data,
  };

  try {
    const response = await axios(config);
    const responseData = response.data;
    const jwtToken = responseData.data.jwtToken;
    const feedToken = responseData.data.feedToken;

    const fromDate = getPreviousDayFormattedDate();
    const toDate = fromDate;

    console.log("FromDate ", fromDate);
    console.log("ToDate ", toDate);

    const data2 = JSON.stringify({
      exchange: "NSE",
      symboltoken: "99926000",
      interval: "ONE_DAY",
      fromdate: fromDate,
      todate: toDate,
    });

    const config2 = {
      method: "post",
      url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData",
      headers: {
        "X-PrivateKey": privateKey,
        Accept: "application/json",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "192.168.43.238",
        "X-ClientPublicIP": "106.193.147.98",
        "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
        "X-UserType": "USER",
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      data: data2,
    };

    const ceresponse = await axios(config2);
    const jsonData = ceresponse.data;
    console.log(jsonData);
    const formattedData = jsonData.data.map(
      ([timestamp, open, high, low, close, volume]) => ({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      })
    );

    const close = formattedData[0].close;
    const target = close * 1.01;
    const negativeTarget = close * 0.99;

    startWebSocket(close, target, jwtToken, feedToken, negativeTarget);
  } catch (error) {
    console.log("Error fetching data:", error);
  }
};

// Function to start WebSocket server and connect
const startWebSocket = (close, target, jwtToken, feedToken, negativeTarget) => {
  const { WebSocketV2 } = require("smartapi-javascript");

  const fetchDataAndConnectWebSocket = async () => {
    try {
      console.log("Previous day close", close);
      console.log("Target for positive ", target);
      console.log("Target for nagative ", negativeTarget);

      web_socket = new WebSocketV2({
        jwttoken: jwtToken,
        apikey: apiKey,
        clientcode: clientcode,
        feedtype: feedToken,
      });

      await web_socket.connect();
      const json_req = {
        correlationID: "abcde12345",
        action: 1,
        mode: 1,
        exchangeType: 1,
        tokens: [`26000`],
      };

      web_socket.fetchData(json_req);
      web_socket.on("tick", receiveTick);

      function receiveTick(data) {
        console.log(
          data.last_traded_price / 100,
          " Target ",
          target,
          " NegativeTarget ",
          negativeTarget
        );

        if (
          data.last_traded_price / 100 > target ||
          data.last_traded_price / 100 < negativeTarget
        ) {
          sendEmail();
          web_socket.close();
        }

        if (wss) {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  wss = new WebSocket.Server({ server });

  wss.on("close", () => {
    console.log("WebSocket Server Closed");
  });

  fetchDataAndConnectWebSocket();
};

// Function to get the previous day's date formatted
const getPreviousDayFormattedDate = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(15, 29, 0, 0);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  const hours = String(yesterday.getHours()).padStart(2, "0");
  const minutes = String(yesterday.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Function to send email alert
const sendEmail = () => {
  console.log(
    "Sending email to user: Market price exceeded +5% of previous day's close."
  );

  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "harshdvadhavana26@gmail.com",
      pass: "cjlt acjg ymwe apzn",
    },
  });

  const mailOptions = {
    from: "harshdvadhavana26@gmail.com",
    to: "harshkumar.vadhavana120072@marwadiuniversity.ac.in , devpateldevpatel1501@gmail.com",
    subject: "Market Price Alert",
    text: "Market price exceeded +5% of previous day's close.",
    html: "<b>Market price exceeded +5% of previous day's close.</b>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error while sending email: ", error);
    }
    console.log("Email sent: " + info.response);
  });
};