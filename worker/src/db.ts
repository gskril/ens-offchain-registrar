import { get } from './handlers/functions/get'

type PromiseOrResult<T> = T | Promise<T>

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'

export interface Database {
  addr(
    name: string,
    coinType: number
  ): PromiseOrResult<{ addr: string; ttl: number }>
  text(
    name: string,
    key: string
  ): PromiseOrResult<{ value: string; ttl: number }>
  contenthash(
    name: string
  ): PromiseOrResult<{ contenthash: string; ttl: number }>
}

export interface DatabaseResult {
  result: any[]
  ttl: number
}

export const database: Database = {
  async addr(name, coinType) {
    try {
      const nameData = await get(name)
      const addr = nameData?.addresses?.[coinType] || ZERO_ADDRESS
      return { addr, ttl: 0 }
    } catch (error) {
      console.error('Error resolving addr', error)
      return { addr: '', ttl: 0 }
    }
  },
  async contenthash(name) {
    try {
      const nameData = await get(name)
      const contenthash = nameData?.contenthash || EMPTY_CONTENT_HASH
      return { contenthash, ttl: 0 }
    } catch (error) {
      console.error('Error resolving contenthash', error)
      return {
        contenthash: EMPTY_CONTENT_HASH,
        ttl: 0,
      }
    }
  },
  async text(name, key) {
    try {
      const nameData = await get(name)
      const value = nameData?.text?.[key] || ''

      return { value, ttl: 0 }
    } catch (error) {
      console.error('Error resolving text', error)
      return { value: '', ttl: 0 }
    }
  },
}
