export interface WorkerRequest {
  name: string
  owner: string
  addresses?: Record<string, string> | undefined
  texts?: Record<string, string> | undefined
  contenthash?: string | undefined
  signature: {
    message: string
    hash: string
  }
}
