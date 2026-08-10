import type { IRequest } from 'itty-router'
import { type Hex, HttpRequestError } from 'viem'
import { isAddress, isHex } from 'viem/utils'
import { z } from 'zod'

import { getRecord } from '../ccip-read/query'
import {
  decodeEnsOffchainRequest,
  encodeEnsOffchainResponse,
} from '../ccip-read/utils'
import type { Env } from '../env'

const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  data: z.string().refine((data) => isHex(data)),
})

// Implements EIP-3668
// https://eips.ethereum.org/EIPS/eip-3668
export const getCcipRead = async (request: IRequest, env: Env) => {
  const safeParse = schema.safeParse(request.params)

  if (!safeParse.success) {
    return Response.json({ error: safeParse.error.issues }, { status: 400 })
  }

  let encodedResponse: Hex

  // Encoding is inside the try because a stored record that can't be ABI
  // encoded (an address of the wrong length, say) would otherwise throw here
  // and return an unhandled 500 with no CORS headers
  try {
    const { name, query } = decodeEnsOffchainRequest(safeParse.data)
    const result = await getRecord(name, query, env)

    encodedResponse = await encodeEnsOffchainResponse(
      safeParse.data,
      result,
      env.PRIVATE_KEY
    )
  } catch (error) {
    const isHttpRequestError = error instanceof HttpRequestError
    const errMessage = isHttpRequestError ? error.message : 'Unable to resolve'
    return Response.json({ message: errMessage }, { status: 400 })
  }

  return Response.json({ data: encodedResponse }, { status: 200 })
}
