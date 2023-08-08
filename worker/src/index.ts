import { SigningKey } from 'ethers/lib/utils'
import { Router, createCors } from 'itty-router'

import { database } from './db'
import { getKeys, getName, setName } from './handlers'
import { makeApp } from './server'

const { preflight, corsify } = createCors()
const router = Router()
router.all('*', preflight)

router.get('/keys', getKeys)
router.get('/get/:name', (request) => getName(request))
router.post('/set', (request) => setName(request))

router.all('*', () => new Response('Not found', { status: 404 }))

const ccipRouteHandler = () => {
  const signer = new SigningKey(PRIVATE_KEY)
  const app = makeApp(signer, '/lookup/', database)
  return app
}

addEventListener('fetch', (event) => {
  const url = event.request.url

  // handle CCIP Read requests
  if (url.includes('/lookup/')) {
    const router = ccipRouteHandler()
    const response = router.handle(event.request)
    return event.respondWith(response.then(corsify))
  }

  // handle other requests
  return event.respondWith(router.handle(event.request).then(corsify))
})
