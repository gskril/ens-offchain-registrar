# CCIP Read Gateway

## API Routes

- `/keys` - GET - Returns all keys in KV
- `/get/:name` - GET - Returns the records for a given key
- `/set` - POST - Sets a record for a given key

> **Warning**
> Need to add the `/:sender/:data` route according to EIP-3668

## Deploy

1. Navigate to this directory: `cd worker`
2. Install [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update), the CloudFlare Worker CLI
3. Run `wrangler login` and follow the prompts
4. Run `wrangler publish` to deploy the Worker globally
