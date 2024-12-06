import {
  AbiItem,
  type ByteArray,
  type Hex,
  type Prettify,
  serializeSignature,
} from 'viem'
import { sign } from 'viem/accounts'
import {
  bytesToString,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionResult,
  encodePacked,
  keccak256,
  parseAbi,
  toBytes,
} from 'viem/utils'

type ResolverQueryAddr = {
  args:
    | readonly [nodeHash: `0x${string}`]
    | readonly [nodeHash: `0x${string}`, coinType: bigint]
  functionName: 'addr'
}

type ResolverQueryText = {
  args: readonly [nodeHash: `0x${string}`, key: string]
  functionName: 'text'
}

type ResolverQueryContentHash = {
  args: readonly [nodeHash: `0x${string}`]
  functionName: 'contenthash'
}

// Equivalent to `DecodeFunctionDataReturnType<typeof RESOLVER_ABI>` but with clearer naming
export type ResolverQuery = Prettify<
  ResolverQueryAddr | ResolverQueryText | ResolverQueryContentHash
>

type DecodedRequestFullReturnType = {
  /**
   * Text value of the ENS name to be resolved.
   */
  name: string
  /**
   * Query to be resolved. Contains a `functionName` denoting the interface name,
   * and `args` containing the necessary arguments. `functionName` can be one of:
   *
   * * `addr`: Address resolution query
   *
   * Follows either [Contract Address Interface](https://docs.ens.domains/ensip/1)
   * or [ENSIP-9 Multichain Addresses interface](https://docs.ens.domains/ensip/9).
   * The resolver must return a [correctly-encoded](https://docs.ens.domains/ensip/9#address-encoding)
   * address for the specified [`coinType`](https://docs.ens.domains/web/resolution#multi-chain),
   * or an empty string if there is no matching value.
   *
   * * `text`: Text resolution query
   *
   * Follows [Text Records interface](https://docs.ens.domains/ensip/11).
   * Common keys include `description`, `url`, `avatar`, `org.telegram`, etc.
   * The resolver must return a UTF-8 encoded string for the specified key,
   * or an empty string if there is no matching value.
   *
   * * `contenthash`: Content hash query
   *
   * Follows [Content Hash interface](https://docs.ens.domains/ensip/7).
   */
  query: ResolverQuery
}

// Taken from ensjs https://github.com/ensdomains/ensjs/blob/main/packages/ensjs/src/utils/hexEncodedName.ts
function bytesToPacket(bytes: ByteArray): string {
  let offset = 0
  let result = ''

  while (offset < bytes.length) {
    const len = bytes[offset]
    if (len === 0) {
      offset += 1
      break
    }

    result += `${bytesToString(bytes.subarray(offset + 1, offset + len + 1))}.`
    offset += len + 1
  }

  return result.replace(/\.$/, '')
}

function dnsDecodeName(encodedName: string): string {
  const bytesName = toBytes(encodedName)
  return bytesToPacket(bytesName)
}

/**
 * ABI for `OffchainResolver.sol`
 * @see https://github.com/ensdomains/offchain-resolver/blob/efb7c02eb8f8fc02a222cd055f9c055919b7a5ae/packages/contracts/contracts/OffchainResolver.sol#L41-L51
 */
const OFFCHAIN_RESOLVER_ABI = parseAbi([
  'function resolve(bytes calldata name, bytes calldata data) view returns(bytes memory result, uint64 expires, bytes memory sig)',
])

/**
 * ABI for the ENS resolver specification
 * @see https://docs.ens.domains/resolvers/interfaces
 */
const RESOLVER_ABI = parseAbi([
  'function addr(bytes32 node) view returns (address)',
  'function addr(bytes32 node, uint256 coinType) view returns (bytes memory)',
  'function text(bytes32 node, string key) view returns (string memory)',
  'function contenthash(bytes32 node) view returns (bytes memory)',
])

/**
 * Decodes CCIP request parameters into an ENS name and a resolver query.
 */
export function decodeEnsOffchainRequest({
  data,
}: {
  sender: `0x${string}`
  data: `0x${string}`
}): DecodedRequestFullReturnType {
  const decodedResolveCall = decodeFunctionData({
    abi: OFFCHAIN_RESOLVER_ABI,
    data,
  })

  const [dnsEncodedName, encodedResolveCall] = decodedResolveCall.args
  const name = dnsDecodeName(dnsEncodedName)
  const query = decodeFunctionData({
    abi: RESOLVER_ABI,
    data: encodedResolveCall,
  })

  return {
    name,
    query,
  }
}

/**
 * Encodes and signs a result as a CCIP response.
 */
export async function encodeEnsOffchainResponse(
  request: { sender: `0x${string}`; data: `0x${string}` },
  result: string,
  signerPrivateKey: Hex
): Promise<Hex> {
  const { sender, data } = request
  const { query } = decodeEnsOffchainRequest({ sender, data })
  const ttl = 1000
  const validUntil = Math.floor(Date.now() / 1000 + ttl)

  // We need to find the correct ABI item for each function, otherwise `addr(node)` and `addr(node, coinType)` causes issues
  const abiItem: AbiItem | undefined = RESOLVER_ABI.find(
    (abi) =>
      abi.name === query.functionName && abi.inputs.length === query.args.length
  )

  // Encode the resolver function result as it would be returned by the contract
  const functionResult = encodeFunctionResult({
    abi: [abiItem],
    functionName: query.functionName,
    result,
  })

  // Prepare the message hash for use in `verify()`, see `makeSignatureHash()` in `SignatureVerifier.sol`
  // https://github.com/ensdomains/offchain-resolver/blob/efb7c02eb8f8fc02a222cd055f9c055919b7a5ae/packages/contracts/contracts/SignatureVerifier.sol#L8-L16
  const messageHash = keccak256(
    encodePacked(
      ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
      [
        '0x1900', // This is hardcoded in the contract (EIP-191).
        sender, // target: The address the signature is for.
        BigInt(validUntil), // expires: The timestamp at which the response becomes invalid.
        keccak256(data), // request: The original request that was sent.
        keccak256(functionResult), // result: The `result` field of the response (not including the signature part).
      ]
    )
  )

  // Sign and encode the response, see `verify()` in `SignatureVerifier.sol`
  // https://github.com/ensdomains/offchain-resolver/blob/efb7c02eb8f8fc02a222cd055f9c055919b7a5ae/packages/contracts/contracts/SignatureVerifier.sol#L18-L34
  const sig = await sign({
    hash: messageHash,
    privateKey: signerPrivateKey,
  })

  // An ABI encoded tuple of `(bytes result, uint64 expires, bytes sig)`, where
  // `result` is the data to return to the caller, and
  // `sig` is the (r,s,v) encoded message signature.
  // Specific to `verify()` in the contract https://etherscan.io/address/0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27#code#F2#L14
  const encodedResponse = encodeAbiParameters(
    [
      { name: 'result', type: 'bytes' },
      { name: 'expires', type: 'uint64' },
      { name: 'sig', type: 'bytes' },
    ],
    [functionResult, BigInt(validUntil), serializeSignature(sig)]
  )

  return encodedResponse
}
