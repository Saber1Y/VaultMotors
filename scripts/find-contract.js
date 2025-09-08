const { ethers } = require('ethers')

async function testMultipleNetworks() {
  console.log('🔍 Testing multiple Sonic networks...\n')

  const contractAddress = '0xde609E52D9164C227D4F174D6260289bc3E62eC2'

  const networks = [
    {
      name: 'Sonic Blaze',
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
      console.log(`📡 Testing ${network.name}...`)
      const provider = new ethers.JsonRpcProvider(network.rpc)
      const networkInfo = await provider.getNetwork()

      console.log(`   Chain ID: ${networkInfo.chainId}`)

      // Check contract
      const code = await provider.getCode(contractAddress)
      const exists = code !== '0x'
      console.log(`   Contract exists: ${exists ? '✅' : '❌'}`)

      if (exists) {
        console.log(`   🎯 FOUND CONTRACT ON ${network.name}!`)

        // Try getAllCars
        const abi = [
          'function getAllCars() external view returns (tuple(uint256,address,string,string[],string,string,string,uint256,string,uint256,string,uint8,uint8,uint8,uint256,string,string[],tuple(string,string,string,uint256,string),bool,bool,uint256,address,uint256)[])',
        ]
        const contract = new ethers.Contract(contractAddress, abi, provider)

        try {
          const cars = await contract.getAllCars()
          console.log(`   🚗 Cars found: ${cars.length}`)
        } catch (err) {
          console.log(`   ❌ getAllCars failed: ${err.message}`)
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    console.log('')
  }
}

testMultipleNetworks()
