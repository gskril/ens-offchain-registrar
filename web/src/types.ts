export interface WorkerRequest {
  signature: {
    message: {
      name: string
      owner: string
      addresses?: Record<string, string | undefined> | undefined
      texts?: Record<string, string | undefined> | undefined
      contenthash?: string | undefined
      /**
       * Part of the signed message so it can't be swapped for a fresh value,
       * which would make a captured signature replayable indefinitely
       */
      expiration: number
    }
    hash: string
  }
}
