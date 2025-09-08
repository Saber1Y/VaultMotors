const { ethers } = require('hardhat')

async function main() {
  console.log('🔗 Testing Sonic Testnet Connection...')

  try {
    // Get provider
    const provider = ethers.provider
    console.log('✅ Provider created')

    // Test network connection
    const network = await provider.getNetwork()
    console.log('✅ Network connected:', network.name, 'Chain ID:', network.chainId.toString())

    // Get signers
    const signers = await ethers.getSigners()
    if (signers.length === 0) {
      console.log('❌ No signers found - check your private key')
      return
    }

    const deployer = signers[0]
    const deployerAddress = await deployer.getAddress()
    console.log('✅ Deployer address:', deployerAddress)

    // Check balance
    const balance = await provider.getBalance(deployerAddress)
    const balanceInEther = ethers.formatEther(balance)
    console.log('💰 Balance:', balanceInEther, 'S')

    if (parseFloat(balanceInEther) === 0) {
      console.log('❌ No funds! You need Sonic testnet tokens to deploy.')
      console.log('🚰 Get tokens from Sonic testnet faucet')
      return
    }

    console.log('✅ Ready to deploy!')
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
