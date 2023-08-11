export interface WorkerRequest {
  name: string
  owner: string
  addresses?: Record<string, string | undefined> | undefined
  texts?: Record<string, string | undefined> | undefined
  contenthash?: string | undefined
  signature: {
    message: string
    hash: string
  }
}
