const Web3 = require("web3");
const { MAINNET_HTTPS_URL, MAINNET_SOCKET_URL } = require("../config");

const web3 = new Web3(new Web3.providers.HttpProvider(MAINNET_HTTPS_URL));
const web3SocketProvider = new Web3(
  new Web3.providers.WebsocketProvider(MAINNET_SOCKET_URL)
);

let logsSubscription;

const getEthBalanceByAddress = (address) => {
  return new Promise((resolve, _) => {
    web3.eth.getBalance(address, function (error, result) {
      if (error) {
        console.log(error);
        resolve({
          error,
        });
      } else {
        resolve({
          balance: web3.utils.fromWei(result, "ether"),
        });
      }
    });
  });
};

const subscribeForLogs = () => {
  logsSubscription = web3SocketProvider.eth
    .subscribe("logs", function (error) {
      if (error) {
        console.log("[PendingTransactions Error] -> ", error);
      }
    })
    .on("data", async function (event) {
      const transaction = await getTransactionByHash(event.transactionHash);
      if (transaction) {
        const { hash, from, to, value, blockNumber } = transaction;
        const transactionEthValue = Number(web3.utils.fromWei(value, "ether"));
      }
    });
};

const getTransactionByHash = (hash) => {
  return new Promise((resolve, _) => {
    web3.eth.getTransaction(hash, (error, transaction) => {
      if (error) {
        console.log("[GetTransaction Error] -> ", error);
        resolve(null);
      } else if (transaction) {
        resolve(transaction);
      }
    });
  });
};

const unsubscribesForLogs = () => {
  // unsubscribes the subscription
  logsSubscription.unsubscribe(function (error, success) {
    if (success) console.log("Successfully unsubscribed!");
    if (error) console.log("Something went wrond during unsubscription!");
  });
};

module.exports = {
  subscribeForLogs,
  unsubscribesForLogs,
  getEthBalanceByAddress,
};
