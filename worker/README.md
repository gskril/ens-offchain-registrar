# CCIP Read Gateway

[CloudFlare Worker](https://developers.cloudflare.com/workers/) is used as the [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway. [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) is used to store subname data.

These choices allow for a scalable namespace with low cost (store up to 1M names for free), low latency, and high availability.

## API Routes

- `/keys` - GET - Returns all keys in KV
- `/get/{name}` - GET - Returns the records for a given key
- `/lookup/{sender}/{data}.json` - GET - CCIP Read lookup
- `/set` - POST - Sets a record for a given key

## Deploy to CloudFlare

1. Navigate to this directory: `cd worker`
2. Run `npx wrangler login` and follow the prompts
3. Run `npx wrangler publish` to deploy the Worker globally
4. Run `echo <PRIVATE_KEY> | npx wrangler secret put PRIVATE_KEY` with the private key of a signer listed on the resolver contract
