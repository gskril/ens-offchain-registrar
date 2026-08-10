import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import { App } from '@/App'
import './index.css'
import { wagmiConfig } from './providers'

const queryClient = new QueryClient()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-between gap-8 p-4">
            <App />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
)
