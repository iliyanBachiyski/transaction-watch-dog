const { subscribeForLogs, subscribeForNewBlockHeaders } = require("./web3");

require("./database");
const express = require("express");
const { PORT } = require("./config");
const configurationRoute = require("./routes/configuration");
const transactionsRoute = require("./routes/transactions");

const app = express();

app.use(express.json());
app.use("/configuration", configurationRoute);
app.use("/transactions", transactionsRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // subscribeForLogs();
  subscribeForNewBlockHeaders();
});
