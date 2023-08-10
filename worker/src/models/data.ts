export interface Name {
  name: string
  records: NameData
}

export interface NameData {
  addresses?: {
    [coinType: number]: string
  }
  texts?: { [key: string]: string }
  contenthash?: string
}
