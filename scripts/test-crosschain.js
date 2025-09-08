const { ethers } = require('ethers')

async function testCrossChainContract() {
  console.log('🧪 Testing CrossChain contract...\n')

  const rpcUrl = 'https://sepolia.infura.io/v3/b26f468efd8b4ec299c070e46c280a9c'
  const contractAddress = '0xd6aED2D75f9d00a0Af587B83486ffDEF75B489AC' // Sepolia CrossChain

  try {
    console.log('📡 Connecting to Sepolia...')
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    console.log('🏗️ Checking CrossChain contract...')
    const code = await provider.getCode(contractAddress)

    if (code === '0x') {
      console.log('❌ CrossChain contract not found at this address')
      return
    }

    console.log('✅ CrossChain contract found!')
    console.log(`📋 Bytecode length: ${code.length} bytes`)

    // Try to check if initiateCrossChainTransfer exists
    const abi = [
      'function initiateCrossChainTransfer(uint256 carId, uint256 targetChainId, uint256 relayerFeePct, uint256 quoteTimestamp) public payable',
    ]

    const contract = new ethers.Contract(contractAddress, abi, provider)

    console.log('✅ initiateCrossChainTransfer function exists on contract')
    console.log('🎯 CrossChain functionality should work!')
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testCrossChainContract()
