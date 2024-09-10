import { AbiItem, Hex } from 'viem'
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

  // Decode the internal resolve call like addr(), text() or contenthash()
  const { functionName, args } = decodeFunctionData({
    abi: resolverAbi,
    data: encodedResolveCall,
  })

  let res: string

  // We need to find the correct ABI item for each function, otherwise `addr(node)` and `addr(node, coinType)` causes issues
  const abiItem: AbiItem | undefined = resolverAbi.find(
    (abi) => abi.name === functionName && abi.inputs.length === args.length
  )

  const nameData = await get(name, env)

  switch (functionName) {
    case 'addr': {
      const coinType = args[1] ?? BigInt(60)
      res = nameData?.addresses?.[coinType.toString()] ?? ZERO_ADDRESS
      break
    }
    case 'text': {
      const key = args[1]
      res = nameData?.texts?.[key] ?? ''
      break
    }
    case 'contenthash': {
      res = nameData?.contenthash ?? EMPTY_CONTENT_HASH
      break
    }
    default: {
      throw new Error(`Unsupported query function ${functionName}`)
    }
  }

  return {
    ttl: 1000,
    result: encodeFunctionResult({
      abi: [abiItem],
      functionName: functionName,
      result: res,
    }),
  }
}
