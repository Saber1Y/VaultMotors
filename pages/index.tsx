import { useState, useEffect } from 'react'
import Head from 'next/head'
import Hero from '@/components/Hero'
import Makers from '@/components/Makers'
import CarList from '@/components/CarList'
import { CarStruct } from '@/utils/type.dt'
import { getAllCars, getEthereumContract } from '@/services/blockchain'

import { useRouter } from 'next/navigation'

const Home = () => {
  const [cars, setCars] = useState<CarStruct[]>([])
  const [loading, setLoading] = useState(true)
  const [end, setEnd] = useState<number>(6)
  const router = useRouter()

  useEffect(() => {
    const loadCars = async () => {
      try {
        const allCars = await getAllCars()
        setCars(allCars)
      } catch (error) {
        console.error('Error loading cars:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCars()
  }, [])

  return (
    <>
      <Head>
        <title>VaultMotors - Premium Sonic Car Marketplace</title>
        <meta name="description" content="Buy and sell luxury cars on the fastest blockchain. Ultra-low fees, instant finality, and secure ownership on Sonic." />
      </Head>
      <div className="bg-gradient-to-r from-gray-900 to-black min-h-screen flex flex-col text-white">
        <Hero />
        <Makers />

        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">Explore Our Collection</h1>
            <p className="text-gray-400 text-lg">
              Find your dream car from our carefully curated selection
            </p>
          </div>

          <CarList cars={cars.slice(0, end)} loading={loading} />

        {cars.length > end && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setEnd(end + 6)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-all duration-300 font-medium"
            >
              View More Cars
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Home
