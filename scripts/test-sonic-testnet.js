const { ethers } = require('ethers')

async function testSonicTestnet() {
  console.log('🧪 Testing Sonic Testnet connection...\n')

  // Correct Sonic Testnet details
  const rpcUrl = 'https://rpc.testnet.soniclabs.com'
  const contractAddress = '0xde609E52D9164C227D4F174D6260289bc3E62eC2'

  try {
    console.log('📡 Connecting to Sonic Testnet...')
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const network = await provider.getNetwork()

    console.log(`🌐 Network: ${network.name}`)
    console.log(`🔗 Chain ID: ${network.chainId} (Expected: 14601)`)

    if (network.chainId.toString() !== '14601') {
      console.log(`⚠️  Warning: Chain ID mismatch!`)
    }

    console.log('🏗️ Checking contract...')
    const code = await provider.getCode(contractAddress)

    if (code === '0x') {
      console.log('❌ Contract not found at this address on Sonic Testnet')
      console.log('🔍 Need to redeploy to Sonic Testnet')
      return false
    }

    console.log('✅ Contract found!')
    console.log(`📋 Bytecode length: ${code.length} bytes`)

    // Try to call getAllCars with proper ABI
    const abi = [
      'function getAllCars() external view returns (tuple(uint256 id, address owner, string name, string[] images, string description, string make, string model, uint256 year, string vin, uint256 mileage, string color, uint8 condition, uint8 transmission, uint8 fuelType, uint256 price, string location, string[] features, tuple(string wallet, string sellerName, string email, uint256 phoneNumber, string profileImage) seller, bool sold, bool deleted, uint256 destinationChainId, address paymentToken, uint256 sourceChainId)[])',
    ]

    const contract = new ethers.Contract(contractAddress, abi, provider)

    console.log('🚗 Calling getAllCars()...')
    const cars = await contract.getAllCars()

    console.log(`✅ Success! Found ${cars.length} cars`)

    if (cars.length > 0) {
      console.log('🎯 Sample car data:')
      console.log(`   Name: ${cars[0].name}`)
      console.log(`   Make: ${cars[0].make}`)
      console.log(`   Price: ${ethers.formatEther(cars[0].price)} S`)
    } else {
      console.log('📝 No cars listed yet - the contract is working but empty')
    }

    return true
  } catch (error) {
    console.log('❌ Error:', error.message)

    if (error.code === 'CALL_EXCEPTION') {
      console.log('🔧 This might be a contract deployment issue')
    } else if (error.code === 'NETWORK_ERROR') {
      console.log('🌐 Network connection issue')
    }

    return false
  }
}

testSonicTestnet()
