import { IRequest } from 'itty-router'
import { isAddress, isHex } from 'viem/utils'
import { z } from 'zod'

import { getRecord } from '../ccip-read/query'
import {
  decodeEnsOffchainRequest,
  encodeEnsOffchainResponse,
} from '../ccip-read/utils'
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

  const { name, query } = decodeEnsOffchainRequest(safeParse.data)
  const result = await getRecord(name, query, env)

  const ttl = 1000
  const validUntil = Math.floor(Date.now() / 1000 + ttl)
  const encodedResponse = encodeEnsOffchainResponse(
    safeParse.data,
    {
      result,
      validUntil,
    },
    env.PRIVATE_KEY
  )

  return Response.json({ data: encodedResponse }, { status: 200 })
}
