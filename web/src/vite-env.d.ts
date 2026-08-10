/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the CCIP Read gateway, i.e. the Cloudflare Worker in `/worker` */
  readonly VITE_GATEWAY_URL?: string
  /** WalletConnect project ID from https://cloud.reown.com */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
