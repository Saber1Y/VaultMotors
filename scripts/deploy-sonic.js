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
  console.log('Deploying HemDealer...')
  const hemDealer = await HemDealer.deploy()
  await hemDealer.waitForDeployment()
  const hemDealerAddress = await hemDealer.getAddress()
  console.log('HemDealer deployed to:', hemDealerAddress)

  // Deploy HemDealerCrossChain
  const HemDealerCrossChain = await ethers.getContractFactory('HemDealerCrossChain')
  console.log('Deploying HemDealerCrossChain...')

  // Sonic testnet Across Protocol SpokePool (placeholder - needs real address)
  const spokePoolAddress = '0x0000000000000000000000000000000000000000' // Update with real Sonic SpokePool
  const acrossRouterAddress = '0x0000000000000000000000000000000000000000' // Update with real Across Router

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
    network: 'sonic',
    chainId: 146,
    deployedAt: new Date().toISOString(),
  }

  fs.writeFileSync(
    'contracts/contractAddresses-sonic.json',
    JSON.stringify(contractAddresses, null, 2)
  )

  console.log('\n=== Deployment Summary ===')
  console.log('Network: Sonic Mainnet (Chain ID: 146)')
  console.log('HemDealer:', hemDealerAddress)
  console.log('HemDealerCrossChain:', crossChainAddress)
  console.log('Contract addresses saved to contracts/contractAddresses-sonic.json')

  console.log('\n=== Environment Variables ===')
  console.log(`NEXT_PUBLIC_SONIC_HEMDEALER_ADDRESS=${hemDealerAddress}`)
  console.log(`NEXT_PUBLIC_SONIC_CROSSCHAIN_ADDRESS=${crossChainAddress}`)
  console.log(`NEXT_PUBLIC_SONIC_ACROSS_ADDRESS=${acrossRouterAddress}`)

  console.log('\n=== Verification Commands ===')
  console.log(`npx hardhat verify --network sonic ${hemDealerAddress}`)
  console.log(
    `npx hardhat verify --network sonic ${crossChainAddress} "${hemDealerAddress}" "${spokePoolAddress}" "${acrossRouterAddress}"`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error)
    process.exit(1)
  })
