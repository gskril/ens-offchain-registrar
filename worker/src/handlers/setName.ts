import zod from 'zod'
import { IRequest } from 'itty-router'
import { verifyMessage } from 'ethers/lib/utils'
import { get } from './functions/get'
import { set } from './functions/set'

export async function setName(request: IRequest) {
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
    records: zod.object({
      addresses: zod.record(zod.string()),
      text: zod.record(zod.string()).optional(),
      contenthash: zod.string().optional(),
    }),
    signature: zod.object({
      hash: zod.string(),
      message: zod.string(),
    }),
  })

  const safeParse = schema.safeParse(await request.json())
  if (!safeParse.success) {
    const response = { error: safeParse.error }
    return new Response(JSON.stringify(response), { status: 400 })
  }

  const { name, records, signature } = safeParse.data

  // validate signature
  try {
    const signer = verifyMessage(signature.message, signature.hash)
    if (signer.toLowerCase() !== records.addresses['60'].toLowerCase()) {
      throw new Error('Invalid signer')
    }
  } catch (err) {
    const response = { error: err }
    return new Response(JSON.stringify(response), { status: 401 })
  }

  // check if the name is already taken, and if the sender owns it
  const existingName = await get(name)
  if (
    existingName &&
    existingName.addresses['60'].toLowerCase() !==
      records.addresses['60'].toLowerCase()
  ) {
    const response = { error: 'Name already taken' }
    return new Response(JSON.stringify(response), { status: 409 })
  }

  const setResponse = await set(name, records)
  return setResponse
}
