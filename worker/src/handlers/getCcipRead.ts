import { SigningKey } from 'ethers/lib/utils'
import { IRequest } from 'itty-router'
import {
  Hex,
  concat,
  encodeAbiParameters,
  encodeFunctionResult,
  encodePacked,
  keccak256,
  toHex,
} from 'viem'
import { sign } from 'viem/accounts'
import { decodeFunctionData, isAddress, isHex, parseAbi } from 'viem/utils'
import { z } from 'zod'

import { database } from '../ccip-read/db'
import { makeApp } from '../ccip-read/server'
import { Env } from '../env'

const resolverAbi = parseAbi([
  'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes memory result, uint64 expires, bytes memory sig)',
  'function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns(bytes memory)',
  'function addr(bytes32) external pure returns (address)',
  'function addr(bytes32, uint256) external pure returns (address)',
  'function text(bytes32, string) external pure returns (string memory)',
  'function contenthash(bytes32) external pure returns (bytes memory)',
])

const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  data: z.string().refine((data) => isHex(data)),
})

export const getCcipRead = async (request: IRequest, env: Env) => {
  const safeParse = schema.safeParse(request.params)

  if (!safeParse.success) {
    return Response.json({ error: safeParse.error }, { status: 400 })
  }

  const { sender, data } = safeParse.data

  // resolve()
  const decodedResolveCall = decodeFunctionData({
    abi: resolverAbi,
    data: data,
  })

  const dnsEncodedName = decodedResolveCall.args[0]

  const ttl = 1000
  const { encodedResult } = handleQuery(decodedResolveCall.args[1] as Hex)
  // const validUntil = Math.floor(Date.now() / 1000 + ttl)
  const validUntil = 1725856909 + 100000

  const messageHash = keccak256(
    encodePacked(
      ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
      [
        '0x1900', // This is hardcoded in the contract but idk why
        sender, // target: The address the signature is for.
        BigInt(validUntil),
        keccak256(data), // request: The original request that was sent.
        keccak256(encodedResult), // result: The `result` field of the response (not including the signature part).
      ]
    )
  )

  const sig = await sign({
    hash: messageHash,
    privateKey: env.PRIVATE_KEY as Hex,
  })
  const sigData = concat([sig.r, sig.s, toHex(sig.v!)])

  // An ABI encoded tuple of `(bytes result, uint64 expires, bytes sig)`, where
  // `result` is the data to return to the caller, and
  // `sig` is the (r,s,v) encoded message signature.
  const encodedResponse = encodeAbiParameters(
    [
      { name: 'result', type: 'bytes' },
      { name: 'expires', type: 'uint64' },
      { name: 'sig', type: 'bytes' },
    ],
    [encodedResult, BigInt(validUntil), sigData]
  )

  // "0x-prefixed hex string containing the result data."
  return Response.json({ data: encodedResponse }, { status: 200 })

  const blah = new SigningKey(env.PRIVATE_KEY)
  const ccipRouter = makeApp(blah, '/lookup/', database, env)
  return ccipRouter.handle(request as unknown as Request)
}

function handleQuery(encodedResolveCall: Hex) {
  // addr(), text(), contenthash()
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
    result,
    encodedResult: encodeFunctionResult({
      abi: resolverAbi,
      functionName: decodedInternalResolveCall.functionName,
      result,
    }),
  }
}
