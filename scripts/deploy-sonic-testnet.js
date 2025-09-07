const { ethers } = require('hardhat')
const fs = require('fs')

async function main() {
  const [deployer] = await ethers.getSigners()
  const deployerAddress = await deployer.getAddress()

  console.log('Deploying contracts with the account:', deployerAddress)
  console.log(
    'Account balance:',
    ethers.formatEther(await deployer.provider.getBalance(deployerAddress))
  )

  // Deploy HemDealer first
  const HemDealer = await ethers.getContractFactory('HemDealer')
  console.log('Deploying HemDealer to Sonic Testnet...')
  const hemDealer = await HemDealer.deploy()
  await hemDealer.waitForDeployment()
  const hemDealerAddress = await hemDealer.getAddress()
  console.log('HemDealer deployed to:', hemDealerAddress)

  // Deploy HemDealerCrossChain
  const HemDealerCrossChain = await ethers.getContractFactory('HemDealerCrossChain')
  console.log('Deploying HemDealerCrossChain...')

  // Sonic testnet addresses (placeholders - update with real addresses when available)
  const spokePoolAddress = '0x0000000000000000000000000000000000000000'
  const acrossRouterAddress = '0x0000000000000000000000000000000000000000'

  const hemDealerCrossChain = await HemDealerCrossChain.deploy(
    hemDealerAddress,
    spokePoolAddress,
    acrossRouterAddress
  )
  await hemDealerCrossChain.waitForDeployment()
  const crossChainAddress = await hemDealerCrossChain.getAddress()
  console.log('HemDealerCrossChain deployed to:', crossChainAddress)

  // Set cross-chain handler in main contract
  console.log('Setting cross-chain handler...')
  await hemDealer.setCrossChainHandler(crossChainAddress)
  console.log('Cross-chain handler set successfully')

  // Save contract addresses
  const contractAddresses = {
    HemDealer: hemDealerAddress,
    HemDealerCrossChain: crossChainAddress,
    AcrossRouter: acrossRouterAddress,
    deployer: deployerAddress,
    network: 'sonicTestnet',
    chainId: 64165,
    deployedAt: new Date().toISOString(),
  }

  fs.writeFileSync(
    'contracts/contractAddresses-sonic-testnet.json',
    JSON.stringify(contractAddresses, null, 2)
  )

  console.log('\n=== Deployment Summary ===')
  console.log('Network: Sonic Testnet (Chain ID: 64165)')
  console.log('HemDealer:', hemDealerAddress)
  console.log('HemDealerCrossChain:', crossChainAddress)
  console.log('Contract addresses saved to contracts/contractAddresses-sonic-testnet.json')

  console.log('\n=== Environment Variables ===')
  console.log(`NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS=${hemDealerAddress}`)
  console.log(`NEXT_PUBLIC_SONIC_TESTNET_CROSSCHAIN_ADDRESS=${crossChainAddress}`)
  console.log(`NEXT_PUBLIC_SONIC_TESTNET_ACROSS_ADDRESS=${acrossRouterAddress}`)

  console.log('\n=== Next Steps ===')
  console.log('1. Add the environment variables to your .env file')
  console.log('2. Update the frontend to use Sonic Testnet')
  console.log('3. Test the deployment with some sample transactions')
  console.log('4. Apply for Sonic Fee Monetization program')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error)
    process.exit(1)
  })
