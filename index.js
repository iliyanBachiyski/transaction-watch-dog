require("./expressApp");
const { subscribeForPendingTransactions } = require("./web3");

subscribeForPendingTransactions();
