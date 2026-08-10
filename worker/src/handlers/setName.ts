import type { IRequest } from 'itty-router'
import { verifyMessage } from 'viem'

import type { Env } from '../env'
import { ZodNameWithSignature } from '../models'
import { get } from './functions/get'
import { set } from './functions/set'

export async function setName(request: IRequest, env: Env): Promise<Response> {
  const body = await request.json()
  const safeParse = ZodNameWithSignature.safeParse(body)

  if (!safeParse.success) {
    const response = { success: false, error: safeParse.error.issues }
    return Response.json(response, { status: 400 })
  }

  const { signature } = safeParse.data
  const { name, owner, expiration } = signature.message

  // Only allow direct subnames of the parent, i.e. no nested subdomains
  const parentName = env.PARENT_NAME || 'offchaindemo.eth'
  const suffix = `.${parentName}`
  const label = name.endsWith(suffix) ? name.slice(0, -suffix.length) : ''

  if (!label || label.includes('.')) {
    const response = {
      success: false,
      error: `Name must be a direct subname of ${parentName}`,
    }
    return Response.json(response, { status: 400 })
  }

  // Validate signature
  try {
    const isVerified = await verifyMessage({
      address: owner,
      message: JSON.stringify(signature.message),
      signature: signature.hash,
    })

    if (!isVerified) {
      throw new Error('Invalid signer')
    }
  } catch (err) {
    console.error(err)
    // An Error serializes to `{}`, so send something the client can read
    const response = { success: false, error: 'Invalid signature' }
    return Response.json(response, { status: 401 })
  }

  // Check the signature expiration. This is inside the signed message, so it
  // can't be refreshed by whoever submits the request.
  if (expiration < Date.now()) {
    const response = { success: false, error: 'Signature expired' }
    return Response.json(response, { status: 401 })
  }

  // Check if the name is already taken
  const existingName = await get(name, env)

  // If the name is owned by someone else, return an error
  if (existingName && existingName.owner !== owner) {
    const response = { success: false, error: 'Name already taken' }
    return Response.json(response, { status: 409 })
  }

  // Save the name
  try {
    await set(signature.message, env)
    const response = { success: true }
    return Response.json(response, { status: 201 })
  } catch (err) {
    console.error(err)
    const response = { success: false, error: 'Error setting name' }
    return Response.json(response, { status: 500 })
  }
}
