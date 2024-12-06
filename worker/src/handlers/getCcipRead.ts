import { IRequest } from 'itty-router'
import { HttpRequestError } from 'viem'
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

  let result: string

  try {
    const { name, query } = decodeEnsOffchainRequest(safeParse.data)
    result = await getRecord(name, query, env)
  } catch (error) {
    const isHttpRequestError = error instanceof HttpRequestError
    const errMessage = isHttpRequestError ? error.message : 'Unable to resolve'
    return Response.json({ message: errMessage }, { status: 400 })
  }

  const encodedResponse = await encodeEnsOffchainResponse(
    safeParse.data,
    result,
    env.PRIVATE_KEY
  )

  return Response.json({ data: encodedResponse }, { status: 200 })
}
