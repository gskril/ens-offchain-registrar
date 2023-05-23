import type { IRequest } from 'itty-router'
import zod from 'zod'

import { get } from './functions/get'

export async function getName(request: IRequest) {
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
  })
  const safeParse = schema.safeParse(request.params)

  if (!safeParse.success) {
    const response = { error: safeParse.error }
    return new Response(JSON.stringify(response), { status: 400 })
  }

  const { name } = safeParse.data
  const nameData = await get(name)

  if (nameData === null) {
    const response = { error: `No records found for ${name}` }
    return new Response(JSON.stringify(response), { status: 404 })
  }

  return new Response(JSON.stringify(nameData), {
    status: 200,
  })
}
