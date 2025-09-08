import { ethers } from 'ethers'
import abi from '../artifacts/contracts/HemDealer.sol/HemDealer.json'
import crossChainAbi from '../artifacts/contracts/HemDealerCrossChain.sol/HemDealerCrossChain.json'
import { CarParams, CarStruct, SalesStruct } from '@/utils/type.dt'
import { chainConfig } from '../config/chains'

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: number) => ethers.formatEther(num)

let ethereum: any
let tx: any
let cachedProvider: ethers.BrowserProvider | null = null
let cachedContract: ethers.Contract | null = null
let cachedChainId: number | null = null

if (typeof window !== 'undefined') ethereum = (window as any).ethereum

const getChainConfig = (chainId: number) => {
  // Support both Sepolia and Sonic networks
  if (chainId === 11155111) {
    return {
      chainId: 11155111,
      name: 'Sepolia',
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/demo',
      contracts: {
        HemDealer: process.env.NEXT_PUBLIC_SEPOLIA_HEMDEALER_ADDRESS || '',
        HemDealerCrossChain: process.env.NEXT_PUBLIC_SEPOLIA_CROSSCHAIN_ADDRESS || '',
        AcrossRouter: process.env.NEXT_PUBLIC_SEPOLIA_ACROSS_ADDRESS || '',
      },
      explorer: 'https://sepolia.etherscan.io',
    }
  }

  // Sonic Testnet (chain ID 14601)
  if (chainId === 14601) {
    return {
      chainId: 14601,
      name: 'Sonic Testnet',
      rpcUrl: 'https://rpc.testnet.soniclabs.com',
      contracts: {
        HemDealer: process.env.NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS || '',
        HemDealerCrossChain: process.env.NEXT_PUBLIC_SONIC_TESTNET_CROSSCHAIN_ADDRESS || '',
        AcrossRouter: process.env.NEXT_PUBLIC_SONIC_TESTNET_ACROSS_ADDRESS || '',
      },
      explorer: 'https://testnet.soniclabs.com',
    }
  }

  // Default to Sonic Testnet if unknown chain ID
  return {
    chainId: 14601,
    name: 'Sonic Testnet',
    rpcUrl: 'https://rpc.testnet.soniclabs.com',
    contracts: {
      HemDealer: process.env.NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS || '',
      HemDealerCrossChain: process.env.NEXT_PUBLIC_SONIC_TESTNET_CROSSCHAIN_ADDRESS || '',
      AcrossRouter: process.env.NEXT_PUBLIC_SONIC_TESTNET_ACROSS_ADDRESS || '',
    },
    explorer: 'https://testnet.soniclabs.com',
  }
}

const getEthereumContract = async (chainId?: number) => {
  try {
    // If no ethereum object, use read-only provider for Sonic Testnet (where we deployed)
    if (!ethereum) {
      console.warn('No wallet provider detected. Using read-only Sonic Testnet provider.')
      const config = {
        chainId: 14601,
        name: 'Sonic Testnet',
        rpcUrl: 'https://rpc.testnet.soniclabs.com',
        contracts: {
          HemDealer: process.env.NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS || '',
          HemDealerCrossChain: process.env.NEXT_PUBLIC_SONIC_TESTNET_CROSSCHAIN_ADDRESS || '',
          AcrossRouter: process.env.NEXT_PUBLIC_SONIC_TESTNET_ACROSS_ADDRESS || '',
        },
        explorer: 'https://testnet.soniclabs.com',
      }
      const provider = new ethers.JsonRpcProvider(config.rpcUrl)
      return new ethers.Contract(config.contracts.HemDealer, abi.abi, provider)
    }

    const accounts = await ethereum?.request?.({ method: 'eth_accounts' })
    const currentChainIdHex = chainId
      ? `0x${chainId.toString(16)}`
      : await ethereum?.request({ method: 'eth_chainId' })

    // Parse hex chain ID to number correctly
    const currentChainIdParsed =
      typeof currentChainIdHex === 'string'
        ? parseInt(currentChainIdHex, 16)
        : Number(currentChainIdHex)

    const config = getChainConfig(currentChainIdParsed)

    if (!config) throw new Error('Unsupported chain')

    if (accounts?.length > 0) {
      if (!cachedProvider || cachedChainId !== currentChainIdParsed) {
        cachedProvider = new ethers.BrowserProvider(ethereum)
        cachedChainId = currentChainIdParsed
      }
      if (!cachedContract || cachedChainId !== currentChainIdParsed) {
        const signer = await cachedProvider.getSigner()
        cachedContract = new ethers.Contract(config.contracts.HemDealer, abi.abi, signer)
        cachedChainId = currentChainIdParsed
      }
      return cachedContract
    } else {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl)
      const contract = new ethers.Contract(config.contracts.HemDealer, abi.abi, provider)
      return contract
    }
  } catch (error) {
    console.error('Failed to get Ethereum contract:', error)

    // Fallback to read-only provider
    const config = chainConfig.sepolia
    const provider = new ethers.JsonRpcProvider(config.rpcUrl)
    return new ethers.Contract(config.contracts.HemDealer, abi.abi, provider)
  }
}

const getCrossChainContract = async (chainId?: number) => {
  const accounts = await ethereum?.request?.({ method: 'eth_accounts' })

  // Get current chain ID - fix the logic here
  let currentChainId: number
  if (chainId) {
    currentChainId = chainId
  } else {
    const currentChainIdHex = await ethereum?.request({ method: 'eth_chainId' })
    currentChainId =
      typeof currentChainIdHex === 'string'
        ? parseInt(currentChainIdHex, 16)
        : Number(currentChainIdHex)
  }

  console.log('🔗 getCrossChainContract - Current Chain ID:', currentChainId)

  const config = getChainConfig(currentChainId)

  if (!config) {
    console.error('❌ Unsupported chain ID:', currentChainId)

    // If user is on Sonic Blaze (57054), suggest switching to Sonic Testnet (14601)
    if (currentChainId === 57054) {
      throw new Error(
        `You're connected to Sonic Blaze (Chain ID: 57054). Please switch to Sonic Testnet (Chain ID: 14601) in your wallet.\n\nNetwork Details:\n- RPC URL: https://rpc.testnet.soniclabs.com\n- Chain ID: 14601\n- Currency Symbol: S`
      )
    }

    throw new Error(
      `Unsupported chain ID: ${currentChainId}. Please switch to Sepolia (11155111) or Sonic Testnet (14601).`
    )
  }

  console.log('🏗️ Using config for', config.name)
  console.log('📍 CrossChain contract address:', config.contracts.HemDealerCrossChain)
  console.log('🌐 RPC URL:', config.rpcUrl)

  if (accounts?.length > 0) {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      config.contracts.HemDealerCrossChain,
      crossChainAbi.abi,
      signer
    )

    console.log('✅ Created CrossChain contract with signer')
    return contract
  } else {
    // Use the correct RPC URL from config, not environment variable
    const provider = new ethers.JsonRpcProvider(config.rpcUrl)

    const contract = new ethers.Contract(
      config.contracts.HemDealerCrossChain,
      crossChainAbi.abi,
      provider
    )

    console.log('✅ Created CrossChain contract with provider')
    return contract
  }
}

const listCar = async (car: CarParams): Promise<void> => {
  if (!ethereum) {
    console.error('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }
  try {
    const isSupported = await isSupportedToken(car.paymentToken)

    if (!isSupported) {
      console.error('Payment token not supported:', car.paymentToken)
      return Promise.reject(new Error('Unsupported payment token'))
    }

    if (car.paymentToken !== ethers.ZeroAddress) {
      return Promise.reject(new Error('Only native token is supported'))
    }
    const formattedCar = {
      ...car,
      basicDetails: {
        ...car.basicDetails,
        year: Number(car.basicDetails.year),
        vin: car.basicDetails.vin.toString(),
      },
      technicalDetails: {
        ...car.technicalDetails,
        mileage: Number(car.technicalDetails.mileage),
        condition: Number(car.technicalDetails.condition),
        transmission: Number(car.technicalDetails.transmission),
        fuelType: Number(car.technicalDetails.fuelType),
        price: ethers.parseEther(car.technicalDetails.price.toString()),
      },
    }

    console.log('Sending car data to blockchain:', formattedCar)

    const contract = await getEthereumContract()
    const gasPrice = await cachedProvider?.getFeeData()

    // Estimate gas with a fallback
    const gasLimit = await contract.listCar
      .estimateGas(
        formattedCar.basicDetails,
        formattedCar.technicalDetails,
        formattedCar.additionalInfo,
        formattedCar.sellerDetails,
        formattedCar.destinationChainId,
        formattedCar.paymentToken
      )
      .catch(() => BigInt(500000))

    tx = await contract.listCar(
      formattedCar.basicDetails,
      formattedCar.technicalDetails,
      formattedCar.additionalInfo,
      formattedCar.sellerDetails,
      formattedCar.destinationChainId,
      formattedCar.paymentToken,
      {
        gasLimit: gasLimit,
        maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
        maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
      }
    )

    console.log('Transaction hash:', tx.hash)
    await tx.wait()
    console.log('Transaction confirmed')
    return Promise.resolve(tx)
  } catch (error: any) {
    console.error('Contract call failed:', {
      error,
      message: error.message,
      data: error.data,
      args: error.errorArgs,
    })
    return Promise.reject(error)
  }
}

const updateCar = async (carId: number, car: CarParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const contract = await getEthereumContract()
    const gasPrice = await cachedProvider?.getFeeData()

    const gasLimit = await contract.updateCar
      .estimateGas(
        carId,
        car.basicDetails,
        car.technicalDetails,
        car.additionalInfo,
        car.sellerDetails
      )
      .catch(() => BigInt(400000))

    tx = await contract.updateCar(
      carId,
      car.basicDetails,
      car.technicalDetails,
      car.additionalInfo,
      car.sellerDetails,
      {
        gasLimit: gasLimit,
        maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
        maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
      }
    )

    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const deleteCar = async (carId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const contract = await getEthereumContract()

    const gasLimit = await contract.deleteCar.estimateGas(carId).catch(() => BigInt(300000))
    const gasPrice = await cachedProvider?.getFeeData()

    tx = await contract.deleteCar(carId, {
      gasLimit: gasLimit,
      maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
      maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
    })

    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getCar = async (carId: number): Promise<CarStruct | null> => {
  try {
    const contract = await getEthereumContract()
    tx = await contract.getCar(carId)
    return Promise.resolve(tx)
  } catch (error: any) {
    if (error?.reason === 'Car has been deleted') {
      return Promise.resolve(null)
    }
    reportError(error)
    return Promise.reject(error)
  }
}

const getAllCars = async (): Promise<CarStruct[]> => {
  try {
    // Use environment variable to switch networks for testing
    const testNetwork = process.env.NEXT_PUBLIC_TEST_NETWORK || 'sonic'

    let config
    if (testNetwork === 'sepolia') {
      config = {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/b26f468efd8b4ec299c070e46c280a9c',
        contracts: {
          HemDealer: process.env.NEXT_PUBLIC_SEPOLIA_HEMDEALER_ADDRESS || '',
          HemDealerCrossChain: process.env.NEXT_PUBLIC_SEPOLIA_CROSSCHAIN_ADDRESS || '',
          AcrossRouter: process.env.NEXT_PUBLIC_SEPOLIA_ACROSS_ADDRESS || '',
        },
        explorer: 'https://sepolia.etherscan.io',
      }
    } else {
      // Default to Sonic Testnet
      config = {
        chainId: 14601,
        name: 'Sonic Testnet',
        rpcUrl: 'https://rpc.testnet.soniclabs.com',
        contracts: {
          HemDealer: process.env.NEXT_PUBLIC_SONIC_TESTNET_HEMDEALER_ADDRESS || '',
          HemDealerCrossChain: process.env.NEXT_PUBLIC_SONIC_TESTNET_CROSSCHAIN_ADDRESS || '',
          AcrossRouter: process.env.NEXT_PUBLIC_SONIC_TESTNET_ACROSS_ADDRESS || '',
        },
        explorer: 'https://testnet.soniclabs.com',
      }
    }

    console.log('🔧 Test Network Mode:', testNetwork.toUpperCase())
    console.log('Using config for chain:', config.name, config.chainId)
    console.log('Contract address:', config.contracts.HemDealer)
    console.log('RPC URL:', config.rpcUrl)

    if (!config.contracts.HemDealer) {
      throw new Error('Contract address not found in environment variables')
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl)

    // First check if contract exists
    const code = await provider.getCode(config.contracts.HemDealer)
    if (code === '0x') {
      throw new Error(`Contract not found at address ${config.contracts.HemDealer}`)
    }

    const contract = new ethers.Contract(config.contracts.HemDealer, abi.abi, provider)

    const cars: CarStruct[] = await contract.getAllCars()

    console.log('Fetched Cars:', cars)
    return cars
  } catch (error) {
    console.error('Error fetching cars:', error)
    return []
  }
}

const getMyCars = async (): Promise<CarStruct[]> => {
  try {
    const contract = await getEthereumContract()
    tx = await contract.getMyCars()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getAllSales = async (): Promise<SalesStruct[]> => {
  try {
    const contract = await getEthereumContract()

    if (!contract.getAllSales) {
      console.error('getAllSales method not found on contract')
      return []
    }
    const salesData = await contract.getAllSales()

    console.log('Raw sales data from contract:', salesData)
    const validSales = salesData
      .map((sale: any) => ({
        id: Number(sale.id || 0),
        newCarId: Number(sale.newCarId || 0),
        price: sale.price ? BigInt(sale.price.toString()) : BigInt(0),
        owner: sale.owner || '',
      }))
      .filter((sale: SalesStruct) => sale.newCarId > 0)

    console.log('Processed sales data:', validSales)

    return validSales
  } catch (error) {
    console.error('Error in getAllSales:', error)
    reportError(error)
    return []
  }
}

const buyCar = async (carId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const contract = await getEthereumContract()
    const car = await contract.getCar(carId)
    const gasPrice = await cachedProvider?.getFeeData()
    const chainId = await ethereum.request({ method: 'eth_chainId' })
    const currentChainId = parseInt(chainId as string, 16)

    if (car.destinationChainId !== currentChainId) {
      // Cross-chain purchase
      const crossChainContract = await getCrossChainContract()
      const quote = await getAcrossQuote(
        Number(ethers.formatEther(car.price)),
        car.destinationChainId
      )

      // First bridge the payment
      const totalAmount = Number(car.price) + (Number(car.price) * quote.relayerFeePct) / 10000
      const gasLimit = await crossChainContract.bridgePayment
        .estimateGas(
          totalAmount,
          car.seller.wallet,
          car.destinationChainId,
          quote.relayerFeePct,
          quote.quoteTimestamp,
          { value: totalAmount }
        )
        .catch(() => BigInt(350000))

      tx = await crossChainContract.bridgePayment(
        totalAmount,
        car.seller.wallet,
        car.destinationChainId,
        quote.relayerFeePct,
        quote.quoteTimestamp,
        {
          value: totalAmount,
          gasLimit: gasLimit,
          maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
          maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
        }
      )
      await tx.wait()

      // Then initiate the cross-chain transfer
      const transferGasLimit = await crossChainContract.initiateCrossChainTransfer
        .estimateGas(carId, car.destinationChainId, quote.relayerFeePct, quote.quoteTimestamp, {
          value: totalAmount,
        })
        .catch(() => BigInt(450000))

      tx = await crossChainContract.initiateCrossChainTransfer(
        carId,
        car.destinationChainId,
        quote.relayerFeePct,
        quote.quoteTimestamp,
        {
          value: totalAmount,
          gasLimit: transferGasLimit,
          maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
          maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
        }
      )
    } else {
      // Same chain purchase
      const gasLimit = await contract.buyCar
        .estimateGas(
          carId,
          0, // relayerFeePct
          Math.floor(Date.now() / 1000), // quoteTimestamp
          { value: car.price }
        )
        .catch(() => BigInt(350000))

      tx = await contract.buyCar(carId, 0, Math.floor(Date.now() / 1000), {
        value: car.price,
        gasLimit: gasLimit,
        maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
        maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
      })
    }

    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const initiateCrossChainTransfer = async (
  carId: number,
  destinationChainId: number
): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const currentChainIdHex = await ethereum.request({ method: 'eth_chainId' })
    const currentChainId = parseInt(currentChainIdHex as string, 16)

    console.log(
      `🌉 Cross-chain transfer: Car #${carId} from Chain ${currentChainId} → Chain ${destinationChainId}`
    )

    // Check if this is a real cross-chain transfer or same-chain demo
    if (currentChainId === destinationChainId) {
      console.log('� Same-chain transfer detected - showing cross-chain UI flow for demo')
    }

    // For Sepolia (11155111), use real Across integration
    if (currentChainId === 11155111) {
      console.log('🌉 Using REAL Across Protocol from Sepolia')

      const quote = await getAcrossQuote(0, destinationChainId)
      console.log('💰 Quote received:', quote)

      const contract = await getCrossChainContract()
      console.log('🏗️ CrossChain contract address:', await contract.getAddress())

      const transferAmount = ethers.parseEther('0.001') // Small amount for testing
      console.log('💸 Transfer amount:', ethers.formatEther(transferAmount), 'ETH')

      tx = await contract.initiateCrossChainTransfer(
        carId,
        destinationChainId,
        quote.relayerFeePct,
        quote.quoteTimestamp,
        {
          value: transferAmount,
        }
      )
    }
    // For Sonic Testnet (14601), use proof-of-concept implementation
    else if (currentChainId === 14601) {
      console.log('🎮 Using Sonic Testnet proof-of-concept (Across not deployed yet)')

      // Get the car details first
      const mainContract = await getEthereumContract()
      const car = await mainContract.getCar(carId)
      console.log('🚗 Car details:', car)

      // For demo purposes, just transfer the car ownership on the same chain
      // but show it as a "cross-chain" transfer in the UI
      const quote = await getAcrossQuote(0, destinationChainId)
      const transferAmount = ethers.parseEther('0.001')

      // Use the main HemDealer contract's buyCar function instead
      // This simulates the cross-chain transfer completion
      tx = await mainContract.buyCar(
        carId,
        Math.floor(quote.relayerFeePct * 10000), // Convert to basis points
        quote.quoteTimestamp,
        {
          value: car.price, // Pay the actual car price
        }
      )

      console.log('✅ Proof-of-concept transfer completed on Sonic Testnet')
    } else {
      throw new Error(`Unsupported chain for cross-chain transfer: ${currentChainId}`)
    }

    console.log('⏳ Waiting for transaction confirmation...')
    await tx.wait()

    console.log('✅ Cross-chain transfer completed successfully!')
    console.log('🔗 Transaction hash:', tx.hash)

    return Promise.resolve(tx)
  } catch (error) {
    console.error('❌ Cross-chain transfer failed:', error)
    reportError(error)
    return Promise.reject(error)
  }
}

const bridgePayment = async (
  token: string,
  amount: number,
  recipient: string,
  destinationChainId: number
): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const contract = await getCrossChainContract()
    const value = token === ethers.ZeroAddress ? toWei(amount) : 0
    tx = await contract.bridgePayment(token, toWei(amount), recipient, destinationChainId, {
      value,
    })
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getAcrossQuote = async (
  amount: number,
  destinationChainId: number
): Promise<{ relayerFeePct: number; quoteTimestamp: number; amount: string }> => {
  try {
    console.log('Requesting quote for amount:', amount, 'to chain:', destinationChainId)
    const response = await fetch('/api/across-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenSymbol: 'ETH',
        amount: amount.toString(),
        destinationChainId: destinationChainId,
        originChainId: 11155111,
        destinationAddress: '0x0000000000000000000000000000000000000000',
        timestamp: Math.floor(Date.now() / 1000),
        skipAmountLimit: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Quote API error:', errorData)
      // Fallback to a default relayer fee percentage
      return {
        relayerFeePct: 0.1, // 0.1% default fee
        quoteTimestamp: Math.floor(Date.now() / 1000),
        amount: amount.toString(),
      }
    }

    const data = await response.json()
    console.log('Received quote data:', data)
    return {
      relayerFeePct: data.relayerFeePct || 0.1,
      quoteTimestamp: data.timestamp,
      amount: data.updatedOutputAmount || data.outputAmount,
    }
  } catch (error) {
    console.error('Error getting Across quote:', error)
    // Fallback to a default relayer fee percentage in case of any error
    return {
      relayerFeePct: 0.1, // 0.1% default fee
      quoteTimestamp: Math.floor(Date.now() / 1000),
      amount: amount.toString(),
    }
  }
}

const isSupportedToken = async (token: string): Promise<boolean> => {
  try {
    console.log('Checking token support for:', token)
    if (token === ethers.ZeroAddress) {
      console.log('Native token is always supported')
      return true
    }

    try {
      const contract = await getCrossChainContract()
      const result = await contract.supportedTokens(token)
      console.log('Token support result:', result)
      return result
    } catch (error) {
      console.warn('Error checking token support, defaulting to native token only:', error)
      return token === ethers.ZeroAddress
    }
  } catch (error) {
    console.error('Error in isSupportedToken:', error)
    return token === ethers.ZeroAddress
  }
}

const cancelTimedOutTransfer = async (carId: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser provider not found'))
  }

  try {
    const crossChainContract = await getCrossChainContract()
    const gasPrice = await cachedProvider?.getFeeData()

    const gasLimit = await crossChainContract.cancelTimedOutTransfer
      .estimateGas(carId)
      .catch(() => BigInt(300000))

    tx = await crossChainContract.cancelTimedOutTransfer(carId, {
      gasLimit: gasLimit,
      maxFeePerGas: gasPrice?.maxFeePerGas || undefined,
      maxPriorityFeePerGas: gasPrice?.maxPriorityFeePerGas || undefined,
    })

    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const isTransferTimedOut = async (carId: number): Promise<boolean> => {
  try {
    const crossChainContract = await getCrossChainContract()
    return await crossChainContract.isTransferTimedOut(carId)
  } catch (error) {
    console.error('Error checking transfer timeout:', error)
    return false
  }
}

const purchaseCarFromChain = async (carId: number, chainId: number, price: string) => {
  try {
    const contract = await getEthereumContract()
    if (!contract) throw new Error('Contract not initialized')

    // If same chain (Sepolia to Sepolia), do direct purchase
    if (chainId === 11155111) {
      try {
        const tx = await contract.buyCar(carId, 0, Math.floor(Date.now() / 1000), {
          value: ethers.parseEther(price),
        })
        await tx.wait()
        return tx
      } catch (error: any) {
        if (error?.message?.includes('insufficient funds')) {
          throw new Error(
            'Insufficient funds to cover car price and gas fees. Please ensure you have enough ETH for both the car price and transaction fees.'
          )
        } else if (error?.message?.includes('user rejected')) {
          throw new Error('Transaction was rejected by user')
        } else if (error?.message?.includes('Invalid purchase')) {
          throw new Error('This car is not available for purchase')
        } else {
          throw error
        }
      }
    }

    // Otherwise, proceed with cross-chain purchase
    try {
      const quote = await getAcrossQuote(Number(ethers.parseEther(price)), chainId)
      const tx = await contract.buyCar(carId, quote.relayerFeePct, quote.quoteTimestamp, {
        value: ethers.parseEther(quote.amount),
      })
      await tx.wait()
      return tx
    } catch (error: any) {
      if (error?.message?.includes('insufficient funds')) {
        throw new Error(
          'Insufficient funds to cover car price, bridge fees, and gas fees. Please ensure you have enough ETH.'
        )
      } else if (error?.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user')
      } else if (error?.message?.includes('Invalid purchase')) {
        throw new Error('This car is not available for purchase')
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Error purchasing car:', error)
    throw error
  }
}

const validateQuote = async (
  contract: ethers.Contract,
  amount: number,
  relayerFeePct: number,
  quoteTimestamp: number
): Promise<boolean> => {
  try {
    return await contract.validateQuote(toWei(amount), relayerFeePct, quoteTimestamp)
  } catch (error) {
    console.error('Quote validation failed:', error)
    return false
  }
}

export {
  listCar,
  updateCar,
  deleteCar,
  getCar,
  getAllCars,
  getMyCars,
  getAllSales,
  buyCar,
  initiateCrossChainTransfer,
  bridgePayment,
  isSupportedToken,
  cancelTimedOutTransfer,
  getEthereumContract,
  validateQuote,
  isTransferTimedOut,
  getAcrossQuote,
  toWei,
  fromWei,
  purchaseCarFromChain,
  getCrossChainContract,
}
