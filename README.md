# ENS Offchain Registrar (WIP)

This repo builds on top of [ensdomains/offchain-resolver](https://github.com/ensdomains/offchain-resolver) to demonstrate what is effectively an offchain subname registrar for ENS names.

Note: This repo does not include a resolver contract. You can [find that here](https://github.com/ensdomains/offchain-resolver/blob/main/packages/contracts/contracts/OffchainResolver.sol).

> **Warning**
> Right now, the CloudFlare Worker doesn't actually work as the CCIP Read gateway. It's simply an API to handle signatures and read/write to CloudFlare KV. The gateway server for offchaindemo.eth just fetches data from the CloudFlare Worker's API. Next step is to remove the current gateway server and use the Worker for everything.

## Gateway

[CloudFlare Worker](https://developers.cloudflare.com/workers/) is used as the [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway. [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) is used to store subname data.

These choices allow for a scalable namespace with low cost (store up to 1M names for free), low latency, and high availability.

## Frontend

A bare bones Next.js app that allows users to easily register subnames (i.e. POST to the CloudFlare worker's API) by signing a message with their wallet.
