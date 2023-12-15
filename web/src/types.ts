export interface WorkerRequest {
  signature: {
    message: {
      name: string
      owner: string
      addresses?: Record<string, string | undefined> | undefined
      texts?: Record<string, string | undefined> | undefined
      contenthash?: string | undefined
    }
    hash: string
  }
  expiration: number
}
