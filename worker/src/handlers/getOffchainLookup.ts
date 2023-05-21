import zod from 'zod'
import { Buffer } from 'buffer'
import { IRequest } from 'itty-router'
import {
  Interface,
  SigningKey,
  hexConcat,
  keccak256,
  solidityKeccak256,
  isAddress,
  isBytesLike,
  BytesLike,
  Result,
  FunctionFragment,
  hexlify,
} from 'ethers/lib/utils'

import { abi as IResolverService_abi } from '@ensdomains/offchain-resolver-contracts/artifacts/contracts/OffchainResolver.sol/IResolverService.json'
import { abi as Resolver_abi } from '@ensdomains/ens-contracts/artifacts/contracts/resolvers/Resolver.sol/Resolver.json'
import { get } from './functions/get'
import { buildResponse, decodeDnsName, getFunctionSelector } from '../utils'

const Resolver = new Interface(Resolver_abi)

const schema = zod.object({
  sender: zod.string().startsWith('0x').length(42),
  data: zod.string(),
})

interface RPCCall {
  to: BytesLike
  data: BytesLike
}

interface RPCResponse {
  status: number
  body: any
}

type HandlerFunc = (
  args: Result,
  req: RPCCall
) => Promise<Array<any>> | Array<any>

interface Handler {
  type: FunctionFragment
  func: HandlerFunc
}

interface HandlerDescription {
  type: string
  func: HandlerFunc
}

export async function getOffchainLookup(request: IRequest): Promise<Response> {
  const safeParse = schema.safeParse(request.params)

  if (
    !safeParse.success ||
    !isAddress(safeParse.data.sender) ||
    !isBytesLike(safeParse.data.data)
  ) {
    const response = buildResponse(400, {
      data: {
        type: 'string',
        description:
          '0x-prefixed hex string containing the `callData` from the contract',
      },
      sender: {
        type: 'string',
        description:
          '0x-prefixed hex string containing the `sender` parameter from the contract',
      },
    })
    return response
  }

  const { sender, data } = safeParse.data
  const { signature, args } = Resolver.parseTransaction({ data })

  const encodedName = args[0]
  const name = decodeDnsName(Buffer.from(encodedName.slice(2), 'hex'))
  const nameData = await get(name)

  /* 
    Use these for reference: 
    - https://github.com/smartcontractkit/ccip-read/blob/master/packages/worker/src/index.ts
    - https://github.com/ensdomains/offchain-resolver/blob/main/packages/gateway-worker/src/server.ts
  */
  const selector = getFunctionSelector(data)

  // TODO: figure out what to do with the selector
  const result = Resolver.encodeFunctionResult(
    signature,
    [0] // TODO: this should be the result of the handler
  )
  const validUntil = Math.floor(Date.now() / 1000) + 300 // 5 minutes from now

  // Hash and sign the response
  const messageHash = solidityKeccak256(
    ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
    ['0x1900', sender, validUntil, keccak256(data), keccak256(result)]
  )

  const signer = new SigningKey(PRIVATE_KEY)
  const sig = signer.signDigest(messageHash)
  const sigData = hexConcat([sig.r, sig.s, new Uint8Array([sig.v])])
  const response = [result, validUntil, sigData]

  return buildResponse(200, {
    data: {
      type: 'string',
      description: response,
    },
  })
}

// for offchain-resolver.eth:
// sender: 0x6a0ab8706b49f9c55884a09e80e2dce3f86a86ca
// data: 0x9061b923000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000017116f6666636861696e2d7265736f6c7665720365746800000000000000000000000000000000000000000000000000000000000000000000000000000000008459d1d43cfe9398ebc6033e263ac6b22cfbdff7c5ee75e2e1e5185bf96fd97375e0d20d7e00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000006617661746172000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// for sub.offchain-resolver.eth:
// sender: 0x6a0ab8706b49f9c55884a09e80e2dce3f86a86ca
// data: 0x9061b92300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001b03737562116f6666636861696e2d7265736f6c766572036574680000000000000000000000000000000000000000000000000000000000000000000000000044f1cb7e06bd5f582131b662225d6ccb020682e39d5a2057cc144991fc27130abc22313b8600000000000000000000000000000000000000000000000000000000000001f500000000000000000000000000000000000000000000000000000000
