const { ethers } = require('ethers')
require('dotenv').config()

async function checkSonicCars() {
  console.log('🔍 Checking cars on Sonic Testnet...\n')

  const sonicRpc = 'https://rpc.testnet.soniclabs.com'
  const provider = new ethers.JsonRpcProvider(sonicRpc)

  const hemDealerAddress = process.env.NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS
  console.log('HemDealer contract:', hemDealerAddress)

  const abi = require('../artifacts/contracts/HemDealer.sol/HemDealer.json')

  try {
    const contract = new ethers.Contract(hemDealerAddress, abi.abi, provider)

    console.log('📋 Getting all cars...')
    const cars = await contract.getAllCars()

    console.log(`Total cars found: ${cars.length}`)
    console.log('')

    if (cars.length === 0) {
      console.log('❌ No cars found on Sonic Testnet!')
      console.log('You need to list a car first before you can view car details.')
      console.log('')
      console.log('💡 Solution: Go to /cars/list and create a new car listing.')
      return
    }

    cars.forEach((car, index) => {
      console.log(`🚗 Car ${index + 1}:`)
      console.log(`  ID: ${car.id.toString()}`)
      console.log(`  Name: ${car.name || 'N/A'}`)
      console.log(`  Make: ${car.make || 'N/A'}`)
      console.log(`  Model: ${car.model || 'N/A'}`)
      console.log(`  Available: ${!car.sold && !car.deleted}`)
      console.log(`  Owner: ${car.owner}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkSonicCars().catch(console.error)
