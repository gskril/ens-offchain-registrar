import { verifyMessage } from 'ethers/lib/utils'
import { IRequest } from 'itty-router'
import zod from 'zod'

import { Env } from '../env'
import { get } from './functions/get'
import { set } from './functions/set'

export async function setName(request: IRequest, env: Env): Promise<Response> {
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
    records: zod.object({
      addresses: zod.record(zod.string()),
      texts: zod.record(zod.string()).optional(),
      contenthash: zod.string().optional(),
    }),
    signature: zod.object({
      hash: zod.string(),
      message: zod.string(),
    }),
  })

  const body = await request.json()
  const safeParse = schema.safeParse(body)

  if (!safeParse.success) {
    const response = { success: false, error: safeParse.error }
    return Response.json(response, { status: 400 })
  }

  const { name, records, signature } = safeParse.data

  // Only allow 3LDs, no nested subdomains
  if (name.split('.').length !== 3) {
    const response = { success: false, error: 'Invalid name' }
    return Response.json(response, { status: 400 })
  }

  // validate signature
  try {
    const signer = verifyMessage(signature.message, signature.hash)
    if (signer.toLowerCase() !== records.addresses['60'].toLowerCase()) {
      throw new Error('Invalid signer')
    }
  } catch (err) {
    const response = { success: false, error: err }
    return Response.json(response, { status: 401 })
  }

  // check if the name is already taken, and if the sender owns it
  const existingName = await get(name, env)
  if (existingName) {
    const existingOwner = existingName.addresses?.['60']
    const newOwner = records.addresses?.['60']

    if (existingOwner && newOwner && existingOwner !== newOwner) {
      const response = { success: false, error: 'Name already taken' }
      return Response.json(response, { status: 409 })
    }
  }

  try {
    await set(name, records, env)
    const response = { success: true }
    return Response.json(response, { status: 201 })
  } catch {
    const response = {
      success: false,
      error: 'Error setting name',
    }
    return Response.json(response, { status: 500 })
  }
}
