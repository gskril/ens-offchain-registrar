import { zeroAddress } from 'viem'

import { Env } from '../env'
import { get } from '../handlers/functions/get'
import { ResolverQuery } from './utils'

export async function getRecord(name: string, query: ResolverQuery, env: Env) {
  const { functionName, args } = query

  let res: string
  const nameData = await get(name, env)

  switch (functionName) {
    case 'addr': {
      const coinType = args[1] ?? BigInt(60)
      res = nameData?.addresses?.[coinType.toString()] ?? zeroAddress
      break
    }
    case 'text': {
      const key = args[1]
      res = nameData?.texts?.[key] ?? ''
      break
    }
    case 'contenthash': {
      res = nameData?.contenthash ?? '0x'
      break
    }
    default: {
      throw new Error(`Unsupported query function ${functionName}`)
    }
  }

  return res
}
