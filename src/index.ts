import zod from 'zod'
import { Router } from 'itty-router'
import { get, set } from './handlers/index.js'
import { verifyMessage } from 'ethers/lib/utils.js'
declare const RECORDS: KVNamespace

const router = Router()

router.get('/keys', async () => {
  const allData = await RECORDS.list()
  return new Response(JSON.stringify(allData), {
    status: 200,
  })
})

router.get('/get/:name', async ({ params }) => {
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
  })
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    const response = { error: safeParse.error }
    return new Response(JSON.stringify(response), { status: 400 })
  }

  const { name } = safeParse.data
  const nameData = await get(name)

  if (nameData === null) {
    const response = { error: 'No records found for ${name}' }
    return new Response(JSON.stringify(response), { status: 404 })
  }

  return new Response(JSON.stringify(nameData), {
    status: 200,
  })
})

router.post('/set', async (request) => {
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
})

// 404 fallback
router.all('*', () => {
  const response = { error: 'Not found' }
  return new Response(JSON.stringify(response), { status: 404 })
})

addEventListener('fetch', (event) =>
  event.respondWith(router.handle(event.request))
)
