const { ethers } = require('ethers')

async function testBothNetworks() {
  console.log('🔍 Testing both Sepolia and Sonic Testnet contracts...\n')

  const networks = [
    {
      name: 'Sepolia',
      rpc: 'https://sepolia.infura.io/v3/b26f468efd8b4ec299c070e46c280a9c',
      chainId: 11155111,
      contractAddress: '0xA3ce6131fD8FA3201Ed27aCa73745E3746b8Df89',
    },
    {
      name: 'Sonic Testnet',
      rpc: 'https://rpc.testnet.soniclabs.com',
      chainId: 14601,
      contractAddress: '0xde609E52D9164C227D4F174D6260289bc3E62eC2',
    },
  ]

  const abi = [
    'function getAllCars() external view returns (tuple(uint256,address,string,string[],string,string,string,uint256,string,uint256,string,uint8,uint8,uint8,uint256,string,string[],tuple(string,string,string,uint256,string),bool,bool,uint256,address,uint256)[])',
  ]

  for (const network of networks) {
    try {
      console.log(`📡 Testing ${network.name}...`)
      const provider = new ethers.JsonRpcProvider(network.rpc)
      const networkInfo = await provider.getNetwork()

      console.log(`   Chain ID: ${networkInfo.chainId} (expected: ${network.chainId})`)

      // Check contract
      const code = await provider.getCode(network.contractAddress)
      const exists = code !== '0x'
      console.log(`   Contract exists: ${exists ? '✅' : '❌'}`)

      if (exists) {
        // Try getAllCars
        const contract = new ethers.Contract(network.contractAddress, abi, provider)
        const cars = await contract.getAllCars()
        console.log(`   🚗 Cars found: ${cars.length}`)
        console.log(`   🎯 ${network.name} is READY for testing!`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    console.log('')
  }

  console.log('💡 Testing Strategy:')
  console.log('1. Start with Sepolia (familiar network, good tooling)')
  console.log('2. Test car listing, purchasing, features')
  console.log('3. Once working, switch to Sonic Testnet for hackathon demo')
  console.log('4. Both networks support the same contract interface!')
}

testBothNetworks()
