import { Buffer } from 'buffer'
import packet from 'dns-packet'
import { parseAbi } from 'viem/utils'

export function dnsDecodeName(name: string): string {
  return packet.name.decode(Buffer.from(name.slice(2), 'hex'))
}

export const resolverAbi = parseAbi([
  'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes memory result, uint64 expires, bytes memory sig)',
  'function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns(bytes memory)',
  'function addr(bytes32) external pure returns (address)',
  'function addr(bytes32, uint256) external pure returns (address)',
  'function text(bytes32, string) external pure returns (string memory)',
  'function contenthash(bytes32) external pure returns (bytes memory)',
])
