import { SigningKey } from 'ethers/lib/utils'
import { Router, createCors } from 'itty-router'

import { database } from './ccip-read/db'
import { makeApp } from './ccip-read/server'
import { Env } from './env'
import { getName, getNames, setName } from './handlers'

const { preflight, corsify } = createCors()
const router = Router()

router
  .all('*', preflight)
  .get('/get/:name', (request, env) => getName(request, env))
  .get('/names', (request, env) => getNames(env))
  .post('/set', (request, env) => setName(request, env))
  .all('*', () => new Response('Not found', { status: 404 }))

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname

    // handle CCIP Read requests
    if (pathname.includes('/lookup/')) {
      const signer = new SigningKey(env.PRIVATE_KEY)
      const ccipRouter = makeApp(signer, '/lookup/', database, env)
      return ccipRouter.handle(request).then(corsify)
    }

    // handle other requests
    return router.handle(request, env).then(corsify)
  },
}
