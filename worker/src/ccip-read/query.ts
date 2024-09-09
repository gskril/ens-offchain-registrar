import { Hex } from 'viem'
import { decodeFunctionData, encodeFunctionResult } from 'viem/utils'

import { Env } from '../env'
import { get } from '../handlers/functions/get'
import { dnsDecodeName, resolverAbi } from './utils'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'
const TTL = 1000

export function handleQuery(dnsEncodedName: Hex, encodedResolveCall: Hex) {
  const name = dnsDecodeName(dnsEncodedName)

  const decodedInternalResolveCall = decodeFunctionData({
    abi: resolverAbi,
    data: encodedResolveCall,
  })

  let result: string

  switch (decodedInternalResolveCall.functionName) {
    case 'addr': {
      const coinType = decodedInternalResolveCall.args[1] ?? 60
      result = '0x179A862703a4adfb29896552DF9e307980D19285'
      break
    }
    case 'text': {
      const key = decodedInternalResolveCall.args[1]
      result = 'test'
      break
    }
    case 'contenthash': {
      result = '0x'
      break
    }
    default: {
      throw new Error(
        `Unsupported query function ${decodedInternalResolveCall.functionName}`
      )
    }
  }

  return {
    ttl: 1000,
    encodedResult: encodeFunctionResult({
      abi: resolverAbi,
      functionName: decodedInternalResolveCall.functionName,
      result,
    }),
  }
}
