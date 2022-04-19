const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  PROJECT_ID: process.env.PROJECT_ID,
  MAINNET_HTTPS_URL: process.env.MAINNET_HTTPS_URL,
  MAINNET_SOCKET_URL: process.env.MAINNET_SOCKET_URL,
};
