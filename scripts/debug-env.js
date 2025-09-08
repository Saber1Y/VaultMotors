const { ethers } = require('hardhat')
require('dotenv').config()

async function main() {
  console.log('🔍 Debugging environment...')

  // Check if environment variables are loaded
  console.log('PRIVATE_KEY exists:', !!process.env.PRIVATE_KEY)
  console.log('PRIVATE_KEY starts with 0x:', process.env.PRIVATE_KEY?.startsWith('0x'))
  console.log('PRIVATE_KEY length:', process.env.PRIVATE_KEY?.length)

  // Check Hardhat config
  const config = require('../hardhat.config.js')
  console.log('Sonic Testnet accounts:', config.networks.sonicTestnet.accounts)

  try {
    // Test creating wallet directly
    if (process.env.PRIVATE_KEY) {
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
      console.log('✅ Wallet created directly:', wallet.address)
    }

    // Get signers from Hardhat
    const signers = await ethers.getSigners()
    console.log('Signers count:', signers.length)

    if (signers.length > 0) {
      const deployer = signers[0]
      const deployerAddress = await deployer.getAddress()
      console.log('✅ Deployer address:', deployerAddress)

      const balance = await deployer.provider.getBalance(deployerAddress)
      console.log('💰 Balance:', ethers.formatEther(balance), 'S')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
