# ENS Offchain Registrar Cookies

This is a fork to 
- experiment CCIP with cookies and token authentication
- New ENSjs react hooks 
- Custom on/off chain resolver


### Motivation
Part of experiment during [ETHGlobal SG](https://ethglobal.com/showcase/geist-x3fur)
- whitelist mechanisms
  - onchain
    - ENS TXT
  - offchain
    - cloudflare D1
- decrypt IPFS cid hash
- on/off chain resolver
 - returns contenthash, TXT as in PublicResolver
 - CCIP gateway for other records
- cross-domain cookies

Trust assumption is gateway properly decrypt and return valid content.
Consider use of TEE/ decentralization / chainlink functions for trustless execution.


Major modifications are highlighted in bold

----


This repo builds on top of [ensdomains/offchain-resolver](https://github.com/ensdomains/offchain-resolver) to demonstrate what is effectively an offchain subname registrar for ENS names.

Note: This repo does not include a resolver contract. You can [find that here](https://github.com/ensdomains/offchain-resolver/blob/main/packages/contracts), or use [ccip.tools](https://ccip.tools/) to easily deploy it.

## [Gateway](worker/README.md)

[Cloudflare Worker](https://developers.cloudflare.com/workers/) is used as the [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway. 

A worker version is hosted at https://ens-gateway.debuggingfuturecors.workers.dev/

**[Cloudflare D1](https://developers.cloudflare.com/d1/) is used to store whitelist**

These choices allow for a scalable namespace with low cost (store up to 1M names for free), low latency, and high availability.


## [Frontend](web/README.md)

A bare bones Next.js app that allows users to access websites only if included whitelist. 
There is a button to add yourself into the whitelist.