const express = require("express");
const { PORT } = require("../config");
const { getEthBalanceByAddress } = require("../web3");
require("../database");
const configurationRoute = require("./routes/configuration");
const transactionsRoute = require("./routes/transactions");
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  const address = "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c";
  let message;
  const response = await getEthBalanceByAddress(address);
  if (response.balance) {
    message = `Current balance ot address ${address} is ${response.balance} ETH`;
  } else {
    message = response.error;
  }
  res.send(message);
});

app.use("/configuration", configurationRoute);
app.use("/transactions", transactionsRoute);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
