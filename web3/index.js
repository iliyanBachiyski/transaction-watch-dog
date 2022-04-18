const Web3 = require("web3");

const PROJECT_ID = "3f20a4faa87f4d3c9e81730c5bcae5bf";
const MAINNET_HTTPS_URL = `https://mainnet.infura.io/v3/${PROJECT_ID}`;

const web3 = new Web3(new Web3.providers.HttpProvider(MAINNET_HTTPS_URL));

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

module.exports = { getEthBalanceByAddress };