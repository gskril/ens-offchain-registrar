export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
}

export interface Name {
  name: string
  records: NameData
}

export interface NameData {
  addresses?: {
    [coinType: number]: string
  }
  text?: { [key: string]: string }
  contenthash?: string
}

export interface KVValue {
  value: string
  metadata?: { [key: string]: any }
}

interface KVNamespace {
  get(key: string): Promise<KVValue>
  put(
    key: string,
    value: string,
    metadata?: { [key: string]: any }
  ): Promise<void>
}

declare const RECORDS: KVNamespace
