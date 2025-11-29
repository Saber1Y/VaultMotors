'use client'

import * as React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia, mainnet, polygon } from 'viem/chains'
import { http } from 'viem'

// Define Sonic chains for Privy
const sonic = {
  id: 146,
  name: 'Sonic',
  network: 'sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.soniclabs.com'] },
    default: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'SonicExplorer', url: 'https://soniclabs.com' },
  },
} as const

const sonicTestnet = {
  id: 14601,
  name: 'Sonic Testnet',
  network: 'sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.soniclabs.com'] },
    default: { http: ['https://rpc.testnet.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'SonicTestnetExplorer', url: 'https://testnet.soniclabs.com' },
  },
  testnet: true,
} as const

// Create a query client for react-query
const queryClient = new QueryClient()

// Create wagmi config for Privy
const wagmiConfig = createConfig({
  chains: [sepolia, sonicTestnet, sonic, mainnet, polygon],
  transports: {
    [sepolia.id]: http(),
    [sonicTestnet.id]: http(),
    [sonic.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
})

// Privy configuration
const privyConfig = {
  loginMethods: ['email', 'wallet'],
  appearance: {
    theme: 'dark' as const,
    accentColor: '#3b82f6',
    logo: '/images/assets/hero-banner.png',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' as const,
    noPromptOnSignature: false,
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clzhrmzq4069014o6ipzx63u3'}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
