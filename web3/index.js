const Web3 = require("web3");
const { v4: uuidv4 } = require("uuid");
const { MAINNET_HTTPS_URL, MAINNET_SOCKET_URL } = require("../config");
const {
  DynamicConfigurationModel,
  TransactionSchemaModel,
} = require("../database");

const web3 = new Web3(new Web3.providers.HttpProvider(MAINNET_HTTPS_URL));
const web3SocketProvider = new Web3(
  new Web3.providers.WebsocketProvider(MAINNET_SOCKET_URL)
);

let logsSubscription;
let latestConfiguration;

const subscribeForLogs = () => {
  loadNewConfiguration();
  logsSubscription = web3SocketProvider.eth
    .subscribe("logs", function (error) {
      if (error) {
        console.log("[PendingTransactions Error] -> ", error);
      }
    })
    .on("data", async function (event) {
      if (!latestConfiguration) {
        return;
      }
      const {
        fromAddress,
        toAddress,
        minBlockNumber,
        minTransactionValue,
        maxTransactionValue,
      } = latestConfiguration;

      const { blockNumber, transactionHash } = event;
      if (minBlockNumber && blockNumber < minBlockNumber) {
        return;
      }
      const transaction = await getTransactionByHash(transactionHash);
      if (transaction) {
        const { hash, from, to, value, transactionIndex } = transaction;
        if (!transactionIndex) {
          return;
        }
        const transactionEthValue = Number(web3.utils.fromWei(value, "ether"));

        if (fromAddress && fromAddress !== from) {
          console.log(
            `Transaction '${transactionHash}' is skipped. From address does not match.`
          );
          return;
        }
        if (toAddress && toAddress !== to) {
          console.log(
            `Transaction '${transactionHash}' is skipped. To address does not match.`
          );
          return;
        }
        if (minTransactionValue && transactionEthValue < minTransactionValue) {
          console.log(
            `Transaction '${transactionHash}' is skipped. Min transaction value does not match.`
          );
          return;
        }
        if (maxTransactionValue && transactionEthValue > maxTransactionValue) {
          console.log(
            `Transaction '${transactionHash}' is skipped. Max transaction value does not match.`
          );
          return;
        }
        const transactionModel = new TransactionSchemaModel({
          uuid: uuidv4(),
          transactionHash: hash,
          configuration: latestConfiguration._id,
        });
        const savedTransaction = await transactionModel.save();
        console.log(
          `Transaction with id '${savedTransaction.uuid}' and hash '${transactionHash}' was successfully saved!`
        );
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

const loadNewConfiguration = async () => {
  latestConfiguration = await DynamicConfigurationModel.findOne()
    .getLatest()
    .exec();
  if (latestConfiguration) {
    console.log(
      `Configuration '${latestConfiguration.uuid}' has been loaded...`
    );
  } else {
    console.log("[Warning] No configuration present. Please create one!");
  }
};

const isValidAddress = (address) => {
  return web3.utils.isAddress(address);
};

module.exports = {
  subscribeForLogs,
  unsubscribesForLogs,
  isValidAddress,
  loadNewConfiguration,
};
