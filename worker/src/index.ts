import { Router } from 'itty-router'
import { getKeys, getName, getOffchainLookup, setName } from './handlers'

const router = Router()

router.get('/keys', getKeys)
router.get('/get/:name', (request) => getName(request))
router.get('/:sender/:data', (request) => getOffchainLookup(request))

router.post('/set', (request) => setName(request))

router.all('*', () => new Response('Not found', { status: 404 }))

addEventListener('fetch', (event) =>
  event.respondWith(router.handle(event.request))
)
