# CCIP Read Gateway

[CloudFlare Worker](https://developers.cloudflare.com/workers/) is used as the [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway. [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) is used to store subname data.

These choices allow for a scalable namespace with low cost (store up to 1M names for free), low latency, and high availability.

> **Note**: By default, names are set to expire after 24 hours. This can be disabled by changing the `IS_TEMPORARY` boolean in [wrangler.toml](wrangler.toml).

## API Routes

- `/keys` - GET - Returns all keys in KV
- `/get/{name}` - GET - Returns the records for a given key
- `/lookup/{sender}/{data}.json` - GET - CCIP Read lookup
- `/set` - POST - Sets a record for a given key

## Run Locally

1. Navigate to this directory: `cd worker`
2. Login to CloudFlare: `npx wrangler login`
3. Set your environment variables: `cp .dev.vars.example .dev.vars` (this is the private key for one of the addresses listed as a signer on your resolver contract)
4. Install dependencies: `yarn install`
5. Start the dev server: `yarn dev`

## Deploy to CloudFlare

1. Navigate to this directory: `cd worker`
2. Login to CloudFlare: `npx wrangler login`
3. Deploy the Worker: `npx wrangler publish`
4. Set your environment variable: `echo <PRIVATE_KEY> | npx wrangler secret put PRIVATE_KEY` (this is the private key for one of the addresses listed as a signer on your resolver contract)
