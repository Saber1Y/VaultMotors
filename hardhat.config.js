require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

module.exports = {
  defaultNetwork: 'sonicTestnet',
  networks: {
    sepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon_amoy: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002,
    },
    sonic: {
      url: 'https://rpc.soniclabs.com',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 146,
      gasPrice: 1000000000, // 1 gwei - Sonic's low gas fees
    },
    sonicTestnet: {
      url: 'https://rpc.blaze.soniclabs.com',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 64165,
      gasPrice: 1000000000, // 1 gwei
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
