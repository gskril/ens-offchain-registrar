export interface WorkerRequest {
  name: string
  records: {
    addresses: {
      [coinType: number | string]: string | undefined
    }
    texts?: { [key: string]: string | undefined }
  }
  signature: {
    hash: string | undefined
    message: string | undefined
  }
}
