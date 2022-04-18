const express = require("express");
const { getEthBalanceByAddress } = require("../web3");
const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
