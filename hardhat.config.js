require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

module.exports = {
  defaultNetwork: 'sonicTestnet',
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygon_amoy: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
    sonic: {
      url: 'https://rpc.soniclabs.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 146,
      gasPrice: 1000000000, // 1 gwei - Sonic's low gas fees
    },
    sonicTestnet: {
      url: 'https://rpc.testnet.soniclabs.com', // Correct Sonic Testnet RPC
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 14601, // Correct Sonic Testnet Chain ID
      gasPrice: 20000000000, // 20 gwei - increased gas price
    },
  },
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 40000,
  },
}
