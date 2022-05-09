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
let blockHeadersSubscription;
let latestConfiguration;

const testTransaction = async (transaction) => {
  const {
    hash: transactionHash,
    from,
    to,
    value,
    transactionIndex,
  } = transaction;
  const { fromAddress, toAddress, minTransactionValue, maxTransactionValue } =
    latestConfiguration;

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
    transactionHash,
    configuration: latestConfiguration._id,
  });
  const savedTransaction = await transactionModel.save();
  console.log(
    `Transaction with id '${savedTransaction.uuid}' and hash '${transactionHash}' was successfully saved!`
  );
};

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
        console.log(
          `[Warning] No configuration present. Transaction ${event.transactionHash} has been skiped!`
        );
        return;
      }
      const { minBlockNumber } = latestConfiguration;

      const { blockNumber, transactionHash } = event;
      if (minBlockNumber && blockNumber < minBlockNumber) {
        console.log(
          `Transaction '${transactionHash}' is skipped. Block number is smaller than the min block number.`
        );
        return;
      }
      const transaction = await getTransactionByHash(transactionHash);
      if (transaction) {
        testTransaction(transaction);
      }
    });
};

const subscribeForNewBlockHeaders = () => {
  loadNewConfiguration();
  blockHeadersSubscription = web3SocketProvider.eth
    .subscribe("newBlockHeaders", function (error) {
      if (error) {
        console.error("Error -> ", error);
      }
    })
    .on("data", async function (blockHeader) {
      if (!latestConfiguration) {
        console.log(
          `[Warning] No configuration present. Block ${blockHeader.hash} has been skiped!`
        );
        return;
      }
      const { minBlockNumber } = latestConfiguration;

      const { number, hash } = blockHeader;

      if (minBlockNumber && number < minBlockNumber) {
        console.log(
          `Transaction '${transactionHash}' is skipped. Block number is smaller than the min block number.`
        );
        return;
      }
      if (!hash) {
        return;
      }

      const block = await web3.eth.getBlock(hash, true);
      if (block.transactions.length > 0) {
        console.log(
          "Found " +
            block.transactions.length +
            " transactions in block " +
            blockHeader.hash
        );
        block.transactions.forEach((item) => testTransaction(item));
      } else {
        console.log("No transactions in block " + blockHeader.hash);
      }
    })
    .on("error", console.error);
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

const unsubscribeAllSubscriptions = () => {
  // unsubscribes the subscriptions
  const unsubscribeFunction = function (error, success) {
    if (success) console.log("Successfully unsubscribed!");
    if (error)
      console.log("Something went wrond during unsubscription! -> ", error);
  };
  if (logsSubscription) {
    logsSubscription.unsubscribe(unsubscribeFunction);
  }
  if (blockHeadersSubscription) {
    blockHeadersSubscription.unsubscribe(unsubscribeFunction);
  }
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
  unsubscribeAllSubscriptions,
  isValidAddress,
  loadNewConfiguration,
  subscribeForNewBlockHeaders,
};
