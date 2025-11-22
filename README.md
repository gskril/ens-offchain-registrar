# ENS Offchain Registrar

This repo builds on top of [ensdomains/offchain-resolver](https://github.com/ensdomains/offchain-resolver) to demonstrate what is effectively an offchain subname registrar for ENS names.

Note: This repo does not include a resolver contract. You can [find that here](https://github.com/ensdomains/offchain-resolver/blob/main/packages/contracts), or use [ccip-tools](https://ccip-tools.pages.dev/) to easily deploy it.

## [Gateway](worker/README.md)

The [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway runs as a [Cloudflare Worker](https://developers.cloudflare.com/workers/). Name data is stored in [Cloudflare D1](https://developers.cloudflare.com/d1/).

These choices allow for a scalable namespace with low cost (store up to 1M names for free), low latency, and high availability.

## [Frontend](web/README.md)

A bare bones Next.js app that allows users to easily register subnames (i.e. POST to the Cloudflare worker's API) by signing a message with their wallet.
