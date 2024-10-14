require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {},
    ganache: {
      url: process.env.GANACHE_URL,
      accounts: [
        process.env.GANACHE_PRIVATE_KEY_1,
        // process.env.GANACHE_PRIVATE_KEY_2,
        // process.env.GANACHE_PRIVATE_KEY_3
      ]
    }
  }
};