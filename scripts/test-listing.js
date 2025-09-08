const { ethers } = require('hardhat')

async function main() {
  console.log('🔍 Testing car listing on Sepolia...')

  const [deployer] = await ethers.getSigners()
  const deployerAddress = await deployer.getAddress()
  console.log('Deployer address:', deployerAddress)

  // Contract address on Sepolia
  const contractAddress = '0xA3ce6131fD8FA3201Ed27aCa73745E3746b8Df89'

  // Get contract
  const HemDealer = await ethers.getContractFactory('HemDealer')
  const contract = HemDealer.attach(contractAddress)

  // Test data
  const basicDetails = {
    name: 'Test Tesla Model S',
    images: ['https://example.com/tesla.jpg'],
    description: 'A beautiful Tesla Model S for testing',
    make: 'Tesla',
    model: 'Model S',
    year: 2023,
    vin: 'TEST123456789',
  }

  const technicalDetails = {
    mileage: 15000,
    color: 'Red',
    condition: 0, // New
    transmission: 1, // Automatic
    fuelType: 2, // Electric
    price: ethers.parseEther('0.1'), // 0.1 ETH
  }

  const additionalInfo = {
    location: 'San Francisco, CA',
    carHistory: 'Single owner, well maintained',
    features: ['Autopilot', 'Premium Sound', 'Leather Seats'],
  }

  const sellerDetails = {
    wallet: deployerAddress,
    sellerName: 'Test Seller',
    email: 'test@example.com',
    phoneNumber: 1234567890,
    profileImage: 'https://example.com/avatar.jpg',
  }

  try {
    console.log('Attempting to list car...')

    // Check all requirements
    console.log('✓ Payment token (should be zero):', ethers.ZeroAddress)
    console.log('✓ Seller wallet matches sender:', sellerDetails.wallet === deployerAddress)
    console.log('✓ Price > 0:', technicalDetails.price > 0)
    console.log('✓ Has images:', basicDetails.images.length > 0)
    console.log(
      '✓ Year check:',
      basicDetails.year,
      '<=',
      Math.floor(Date.now() / 1000 / 365 / 24 / 60 / 60) + 1970
    )
    console.log('✓ Mileage check:', technicalDetails.mileage, '<', 1000000000)

    const tx = await contract.listCar(
      basicDetails,
      technicalDetails,
      additionalInfo,
      sellerDetails,
      11155111, // Sepolia chain ID
      ethers.ZeroAddress // Native token
    )

    console.log('Transaction sent:', tx.hash)
    await tx.wait()
    console.log('✅ Car listed successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.data) {
      console.error('Error data:', error.data)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
