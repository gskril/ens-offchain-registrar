import { Env } from '../env'
import { get } from '../handlers/functions/get'

type PromiseOrResult<T> = T | Promise<T>

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'
const TTL = 1000

export interface Database {
  addr(
    name: string,
    coinType: number,
    env: Env
  ): PromiseOrResult<{ addr: string; ttl: number }>
  text(
    name: string,
    key: string,
    env: Env
  ): PromiseOrResult<{ value: string; ttl: number }>
  contenthash(
    name: string,
    env: Env
  ): PromiseOrResult<{ contenthash: string; ttl: number }>
}

export interface DatabaseResult {
  result: any[]
  ttl: number
}

export const database: Database = {
  async addr(name, coinType, env) {
    try {
      const nameData = await get(name, env)
      const addr = nameData?.addresses?.[coinType] || ZERO_ADDRESS
      return { addr, ttl: TTL }
    } catch (error) {
      console.error('Error resolving addr', error)
      return { addr: '', ttl: TTL }
    }
  },
  async contenthash(name, env) {
    try {
      const nameData = await get(name, env)
      const contenthash = nameData?.contenthash || EMPTY_CONTENT_HASH
      return { contenthash, ttl: TTL }
    } catch (error) {
      console.error('Error resolving contenthash', error)
      return {
        contenthash: EMPTY_CONTENT_HASH,
        ttl: TTL,
      }
    }
  },
  async text(name, key, env) {
    try {
      const nameData = await get(name, env)
      const value = nameData?.texts?.[key] || ''

      return { value, ttl: TTL }
    } catch (error) {
      console.error('Error resolving text', error)
      return { value: '', ttl: TTL }
    }
  },
}
