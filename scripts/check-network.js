const { ethers } = require('ethers')

async function checkNetworks() {
  console.log('🔍 Checking network configurations...\n')

  const networks = [
    {
      name: 'Sonic Blaze (from old env)',
      rpc: 'https://rpc.blaze.soniclabs.com',
    },
    {
      name: 'Sonic Testnet',
      rpc: 'https://rpc.testnet.soniclabs.com',
    },
    {
      name: 'Sonic Mainnet',
      rpc: 'https://rpc.soniclabs.com',
    },
  ]

  for (const network of networks) {
    try {
      console.log(`📡 Checking ${network.name}...`)
      const provider = new ethers.JsonRpcProvider(network.rpc)
      const networkInfo = await provider.getNetwork()

      console.log(`   Chain ID: ${networkInfo.chainId}`)
      console.log(`   Name: ${networkInfo.name}`)

      // Check our contract
      const contractAddress = '0xde609E52D9164C227D4F174D6260289bc3E62eC2'
      const code = await provider.getCode(contractAddress)
      console.log(`   Contract exists: ${code !== '0x' ? '✅' : '❌'}`)

      if (code !== '0x') {
        console.log(`   Contract bytecode length: ${code.length}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    console.log('')
  }
}

checkNetworks().catch(console.error)
