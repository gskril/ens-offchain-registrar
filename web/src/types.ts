export interface WorkerRequest {
  name: string
  records: {
    addresses: {
      [coinType: number | string]: string | undefined
    }
    text?: { [key: string]: string | undefined }
  }
  signature: {
    hash: string | undefined
    message: string | undefined
  }
}
