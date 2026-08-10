import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const { connectors } = getDefaultWallets({
  appName: 'Offchain ENS Registrar',
  // https://cloud.reown.com
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
    'd6c989fb5e87a19a4c3c14412d5a7672',
})

export const chains = [mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors: [...connectors],
  transports: {
    [mainnet.id]: http(),
  },
})
