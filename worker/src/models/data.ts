export interface Name {
  name: string
  records: NameData
}

export interface NameData {
  addresses: {
    [coinType: number]: string
  }
  text?: { [key: string]: string }
  contenthash?: string
}
