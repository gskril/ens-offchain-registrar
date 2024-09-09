import { Hex } from 'viem'
import { decodeFunctionData, encodeFunctionResult } from 'viem/utils'

import { Env } from '../env'
import { get } from '../handlers/functions/get'
import { dnsDecodeName, resolverAbi } from './utils'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'

type HandleQueryArgs = {
  dnsEncodedName: Hex
  encodedResolveCall: Hex
  env: Env
}

export async function handleQuery({
  dnsEncodedName,
  encodedResolveCall,
  env,
}: HandleQueryArgs) {
  const name = dnsDecodeName(dnsEncodedName)

  const decodedInternalResolveCall = decodeFunctionData({
    abi: resolverAbi,
    data: encodedResolveCall,
  })

  let res: string

  const nameData = await get(name, env)

  switch (decodedInternalResolveCall.functionName) {
    case 'addr': {
      const coinType = decodedInternalResolveCall.args[1] ?? 60
      res = nameData?.addresses?.[coinType.toString()] ?? ZERO_ADDRESS
      break
    }
    case 'text': {
      const key = decodedInternalResolveCall.args[1]
      res = nameData?.texts?.[key] ?? ''
      break
    }
    case 'contenthash': {
      res = nameData?.contenthash ?? EMPTY_CONTENT_HASH
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
    result: encodeFunctionResult({
      abi: resolverAbi,
      functionName: decodedInternalResolveCall.functionName,
      result: res,
    }),
  }
}
