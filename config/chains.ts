export const chainConfig = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
    contracts: {
      HemDealer: '0x27ac084312e314837ac262999dc53e19d037C7b2',
      HemDealerCrossChain: '0x702a8cBFBEF7b4e25054549e945559666cDdD476',
      AcrossRouter: '0xC499a572640B64eA1C8c194c43Bc3E19940719dC',
    },
    explorer: 'https://sepolia.etherscan.io',
  },
  sonic: {
    chainId: 146, // Sonic Mainnet
    name: 'Sonic',
    rpcUrl: 'https://rpc.soniclabs.com',
    contracts: {
      HemDealer: process.env.NEXT_PUBLIC_SONIC_HEMDEALER_ADDRESS || '',
      HemDealerCrossChain: process.env.NEXT_PUBLIC_SONIC_CROSSCHAIN_ADDRESS || '',
      AcrossRouter: process.env.NEXT_PUBLIC_SONIC_ACROSS_ADDRESS || '',
    },
    explorer: 'https://soniclabs.com',
    nativeCurrency: {
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
    },
  },
  sonicTestnet: {
    chainId: 64165, // Sonic Testnet
    name: 'Sonic Testnet',
    rpcUrl: 'https://rpc.blaze.soniclabs.com',
    contracts: {
      HemDealer: process.env.NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS || '',
      HemDealerCrossChain: process.env.NEXT_PUBLIC_SONIC_TESTNET_CROSSCHAIN_ADDRESS || '',
      AcrossRouter: process.env.NEXT_PUBLIC_SONIC_TESTNET_ACROSS_ADDRESS || '',
    },
    explorer: 'https://testnet.soniclabs.com',
    nativeCurrency: {
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
    },
  },
} as const
