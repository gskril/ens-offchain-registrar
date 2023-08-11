import type { IRequest } from 'itty-router'
import zod from 'zod'

import { Env } from '../env'
import { get } from './functions/get'

export async function getName(request: IRequest, env: Env) {
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
  })
  const safeParse = schema.safeParse(request.params)

  if (!safeParse.success) {
    const response = { error: safeParse.error }
    return Response.json(response, { status: 400 })
  }

  const { name } = safeParse.data
  const nameData = await get(name, env)

  if (nameData === null) {
    return new Response('Name not found', { status: 404 })
  }

  return Response.json(nameData, {
    status: 200,
  })
}
