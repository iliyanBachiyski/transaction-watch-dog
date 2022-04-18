const Web3 = require("web3");

const PROJECT_ID = "3f20a4faa87f4d3c9e81730c5bcae5bf";
const MAINNET_HTTPS_URL = `https://mainnet.infura.io/v3/${PROJECT_ID}`;
const MAINNET_SOCKET_URL = `wss://mainnet.infura.io/ws/v3/${PROJECT_ID}`;

const web3 = new Web3(new Web3.providers.HttpProvider(MAINNET_HTTPS_URL));
const web3SocketProvider = new Web3(
  new Web3.providers.WebsocketProvider(MAINNET_SOCKET_URL)
);

let pendingTransactionsSubscription;

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

const subscribeForPendingTransactions = () => {
  pendingTransactionsSubscription = web3SocketProvider.eth
    .subscribe("pendingTransactions", function (error, hash) {
      if (error) {
        console.log("[PendingTransactions Error] -> ", error);
      } else {
        getTransactionByHash(hash);
      }
    })
    .on("data", function (transaction) {
      // console.log("[PendingTransactions] Data -> ", transaction);
    });
};

const getTransactionByHash = (hash) => {
  web3.eth.getTransaction(hash, async (error, transaction) => {
    if (error) {
      console.log("[GetTransaction Error] -> ", error);
    } else if (transaction) {
      const { from, to, value, hash } = transaction;
      const transactionEthValue = web3.utils.fromWei(value, "ether");
      const { balance: senderBalance } = await getEthBalanceByAddress(from);
      const { balance: receiverBalance } = await getEthBalanceByAddress(to);
      console.log(
        "[GetTransaction Info] -> ",
        `[${hash}]`,
        `Sending ${transactionEthValue} ETH from ${from} (Balance: ${senderBalance} ETH) to ${to} (Balance: ${receiverBalance} ETH)`
      );
    }
  });
};

const unsubscribesForPendingTransactions = () => {
  // unsubscribes the subscription
  pendingTransactionsSubscription.unsubscribe(function (error, success) {
    if (success) console.log("Successfully unsubscribed!");
    if (error) console.log("Something went wrond during unsubscription!");
  });
};

module.exports = {
  subscribeForPendingTransactions,
  unsubscribesForPendingTransactions,
  getEthBalanceByAddress,
};
