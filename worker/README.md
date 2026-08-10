# CCIP Read Gateway

[Cloudflare Worker](https://developers.cloudflare.com/workers/) is used as the [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway. [Cloudflare D1](https://developers.cloudflare.com/d1/) is used to store name data.

These choices allow for a scalable namespace with low cost (store up to 1M names for free), low latency, and high availability.

## API Routes

- `/names` - GET - Returns all names from the database
- `/get/{name}` - GET - Returns the records for a given name
- `/lookup/{sender}/{data}.json` - GET - CCIP Read lookup
- `/set` - POST - Adds a name to the database

## Restricting the Namespace

`PARENT_NAME` in `wrangler.toml` (default `offchaindemo.eth`) controls which names can be written. `/set` only accepts direct subnames of it, so `alice.offchaindemo.eth` is allowed while `alice.example.eth` and `a.b.offchaindemo.eth` are not.

This is a write-side restriction only. Reads are deliberately unrestricted, so the gateway can still serve any name whose resolver points at it. If you change `PARENT_NAME`, set `VITE_PARENT_NAME` in the frontend to match.

## Limitations

This is a demo, and the gateway trades some robustness for simplicity:

- **Only EOA signatures are accepted.** Signatures are checked with viem's offline `verifyMessage`, which [does not support contract accounts](https://viem.sh/docs/utilities/verifyMessage). Smart contract wallets (Safe, Coinbase Smart Wallet / Base Account) sign via [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) and will be rejected with a 401. Supporting them means verifying through a public client with an RPC endpoint.
- **Signatures are replayable until they expire.** `expiration` is part of the signed message, so it can't be extended by whoever submits the request, but there's no nonce — anyone who captures a payload can resubmit it within its validity window and revert the name to those records. Storing a nonce per name would fix it, at the cost of an extra table.
- **There is no rate limiting.** Any address can register unlimited names under the parent.

## Customizing the Gateway

If you want to use the gateway to serve offchain data that does not come from Cloudflare D1, you can customize [src/ccip-read/query.ts](./src/ccip-read/query.ts).

## Run Locally

1. Navigate to this directory: `cd worker`
2. Login to Cloudflare: `bunx wrangler login`
3. Create a D1 instance: `bunx wrangler d1 create <DATABASE_NAME>` and update the `[[d1_databases]]` section of `wrangler.toml` with the returned info
4. Create the default table in the local database: `bun run dev:create-tables`
5. Set your environment variables: `cp .dev.vars.example .dev.vars` (this is the private key for one of the addresses listed as a signer on your resolver contract)
6. Install dependencies: `bun install`
7. Start the dev server: `bun run dev`

## Deploy to Cloudflare

1. Navigate to this directory: `cd worker`
2. Login to Cloudflare: `bunx wrangler login`
3. Deploy the Worker: `bun run deploy`
4. Create the default table in the prod database: `bun run prod:create-tables`
5. Set your environment variable: `echo <PRIVATE_KEY> | bunx wrangler secret put PRIVATE_KEY` (this is the private key for one of the addresses listed as a signer on your resolver contract)
