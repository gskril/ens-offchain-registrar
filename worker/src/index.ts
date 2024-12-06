import { Router, createCors } from 'itty-router'

import { Env } from './env'
import { getCcipRead, getName, getNames, setName } from './handlers'

const { preflight, corsify } = createCors()
const router = Router()

router
  .all('*', preflight)
  // Note: The `.json` extension is not required by the ERC-3668 spec
  .get('/lookup/:sender/:data.json', (req, env) => getCcipRead(req, env))
  .get('/get/:name', (req, env) => getName(req, env))
  .get('/names', (_, env) => getNames(env))
  .post('/set', (req, env) => setName(req, env))
  .all('*', () => new Response('Not found', { status: 404 }))

// Handle requests to the Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return router.handle(request, env).then(corsify)
  },
}
