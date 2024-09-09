import { IRequest } from 'itty-router'
import {
  Hex,
  concat,
  encodeAbiParameters,
  encodePacked,
  keccak256,
  toHex,
} from 'viem'
import { sign } from 'viem/accounts'
import { decodeFunctionData, isAddress, isHex } from 'viem/utils'
import { z } from 'zod'

import { handleQuery } from '../ccip-read/query'
import { resolverAbi } from '../ccip-read/utils'
import { Env } from '../env'

const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  data: z.string().refine((data) => isHex(data)),
})

// Implements EIP-3668
// https://eips.ethereum.org/EIPS/eip-3668
export const getCcipRead = async (request: IRequest, env: Env) => {
  const safeParse = schema.safeParse(request.params)

  if (!safeParse.success) {
    return Response.json({ error: safeParse.error }, { status: 400 })
  }

  const { sender, data } = safeParse.data

  const decodedResolveCall = decodeFunctionData({
    abi: resolverAbi,
    data: data,
  })

  const { encodedResult: result, ttl } = handleQuery(
    decodedResolveCall.args[0],
    decodedResolveCall.args[1] as Hex
  )
  const validUntil = Math.floor(Date.now() / 1000 + ttl)

  // Specific to `makeSignatureHash()` in the contract https://etherscan.io/address/0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27#code#F2#L14
  const messageHash = keccak256(
    encodePacked(
      ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
      [
        '0x1900', // This is hardcoded in the contract but idk why
        sender, // target: The address the signature is for.
        BigInt(validUntil), // expires: The timestamp at which the response becomes invalid.
        keccak256(data), // request: The original request that was sent.
        keccak256(result), // result: The `result` field of the response (not including the signature part).
      ]
    )
  )

  const sig = await sign({
    hash: messageHash,
    privateKey: env.PRIVATE_KEY,
  })
  const sigData = concat([sig.r, sig.s, toHex(sig.v!)])

  // An ABI encoded tuple of `(bytes result, uint64 expires, bytes sig)`, where
  // `result` is the data to return to the caller, and
  // `sig` is the (r,s,v) encoded message signature.
  // Specific to `verify()` in the contract https://etherscan.io/address/0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27#code#F2#L14
  const encodedResponse = encodeAbiParameters(
    [
      { name: 'result', type: 'bytes' },
      { name: 'expires', type: 'uint64' },
      { name: 'sig', type: 'bytes' },
    ],
    [result, BigInt(validUntil), sigData]
  )

  // "0x-prefixed hex string containing the result data."
  return Response.json({ data: encodedResponse }, { status: 200 })
}
