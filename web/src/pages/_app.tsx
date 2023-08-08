import { ThorinGlobalStyles, lightTheme } from '@ensdomains/thorin'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { AppProps } from 'next/app'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { WagmiConfig } from 'wagmi'

import { Layout } from '@/components/Layout'
import { useIsMounted } from '@/hooks/useIsMounted'

import { chains, wagmiConfig } from '../providers'

export default function App({ Component, pageProps }: AppProps) {
  const isMounted = useIsMounted()

  return (
    <ThemeProvider theme={lightTheme}>
      <ThorinGlobalStyles />
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} modalSize="compact">
          <Layout>{isMounted && <Component {...pageProps} />}</Layout>
        </RainbowKitProvider>
      </WagmiConfig>
    </ThemeProvider>
  )
}
