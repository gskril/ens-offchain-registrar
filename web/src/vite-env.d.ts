/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the CCIP Read gateway, i.e. the Cloudflare Worker in `/worker` */
  readonly VITE_GATEWAY_URL?: string
  /** WalletConnect project ID from https://cloud.reown.com */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
  /** Parent name to register under. Must match PARENT_NAME in the Worker */
  readonly VITE_PARENT_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
