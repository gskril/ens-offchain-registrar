import type { NextApiRequest, NextApiResponse } from 'next'
import zod from 'zod'

// This is just a proxy endpoint to 'https://ens-gateway.gregskril.workers.dev/set'
// It's needed because the gateway doesn't natively support CORS

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const safeParse = schema.safeParse(req.body)
  if (!safeParse.success) {
    const response = { error: safeParse.error }
    return res.status(400).json(response)
  }

  const body = safeParse.data

  const url = 'https://ens-gateway.gregskril.workers.dev/set'
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }

  const proxyResponse = await fetch(url, options)
  const proxyResponseJson = await proxyResponse.json()
  return res.status(proxyResponse.status).json(proxyResponseJson)
}
