const { ethers } = require('ethers')

async function debugCrossChainTransfer() {
  console.log('🔍 Debugging cross-chain transfer for car #3...\n')

  const rpcUrl = 'https://sepolia.infura.io/v3/b26f468efd8b4ec299c070e46c280a9c'
  const hemDealerAddress = '0xA3ce6131fD8FA3201Ed27aCa73745E3746b8Df89'
  const crossChainAddress = '0xd6aED2D75f9d00a0Af587B83486ffDEF75B489AC'
  const carId = 3
  const targetChainId = 14601 // Sonic Testnet

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const network = await provider.getNetwork()

    console.log(`📡 Connected to chain ID: ${network.chainId}`)

    // Check the car details
    const hemDealerAbi = [
      'function getCar(uint256 carId) external view returns (tuple(uint256 id, address owner, string name, string[] images, string description, string make, string model, uint256 year, string vin, uint256 mileage, string color, uint8 condition, uint8 transmission, uint8 fuelType, uint256 price, string location, string[] features, tuple(string wallet, string sellerName, string email, uint256 phoneNumber, string profileImage) seller, bool sold, bool deleted, uint256 destinationChainId, address paymentToken, uint256 sourceChainId))',
    ]

    const hemDealer = new ethers.Contract(hemDealerAddress, hemDealerAbi, provider)

    console.log('🚗 Fetching car #3 details...')
    const car = await hemDealer.getCar(carId)
    console.log(`   Owner: ${car.owner}`)
    console.log(`   Name: ${car.name}`)
    console.log(`   Sold: ${car.sold}`)
    console.log(`   Deleted: ${car.deleted}`)

    // Check cross-chain transfer status
    const crossChainAbi = [
      'function crossChainTransferPending(uint256) external view returns (bool)',
    ]

    const crossChain = new ethers.Contract(crossChainAddress, crossChainAbi, provider)
    const isPending = await crossChain.crossChainTransferPending(carId)

    console.log(`   Transfer pending: ${isPending}`)

    // Check chain IDs
    console.log(`\n🌐 Chain validation:`)
    console.log(`   Current chain: ${network.chainId}`)
    console.log(`   Target chain: ${targetChainId}`)
    console.log(`   Same chain: ${network.chainId == targetChainId}`)

    console.log(`\n📋 Requirements check:`)
    console.log(`   ✅ Car exists: ${car.id == carId}`)
    console.log(`   ${car.deleted ? '❌' : '✅'} Not deleted: ${!car.deleted}`)
    console.log(`   ${isPending ? '❌' : '✅'} No pending transfer: ${!isPending}`)
    console.log(
      `   ${network.chainId == targetChainId ? '❌' : '✅'} Different chains: ${
        network.chainId != targetChainId
      }`
    )
    console.log(`   ❓ Is owner: (need to check with your wallet address)`)

    console.log(`\n💡 Your wallet should be: ${car.owner}`)
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

debugCrossChainTransfer()
