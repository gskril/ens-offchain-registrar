import type { ColumnType } from 'kysely'
import { isAddress, isHex } from 'viem'
import z from 'zod'

/**
 * ENSIP-11 encodes EVM chains as `0x80000000 | chainId`, so every coin type at
 * or above that offset resolves to a 20 byte address, as does coin type 60
 * (mainnet ETH). Everything else — Bitcoin, Solana, etc. — is chain-specific
 * bytes of varying length, so we can only check that it's hex.
 * @see https://docs.ens.domains/ensip/11
 */
const EVM_COIN_TYPE_OFFSET = 0x80000000

function isEvmCoinType(coinType: string) {
  const asNumber = Number(coinType)
  return asNumber === 60 || asNumber >= EVM_COIN_TYPE_OFFSET
}

export const ZodName = z.object({
  name: z.string().regex(/^[a-z0-9-.]+$/),
  owner: z.string().refine((owner) => isAddress(owner)),
  addresses: z
    .record(z.string().regex(/^\d+$/), z.string())
    .optional()
    .superRefine((addresses, ctx) => {
      for (const [coinType, addr] of Object.entries(addresses ?? {})) {
        // An address that isn't the right length for its coin type can't be
        // ABI encoded on read, which would break resolution for the whole name
        const isValid = isEvmCoinType(coinType)
          ? isAddress(addr)
          : isHex(addr) && addr.length > 2

        if (!isValid) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid address for coin type ${coinType}`,
            path: [coinType],
          })
        }
      }
    }),
  texts: z.record(z.string(), z.string()).optional(),
  contenthash: z
    .string()
    .refine((contenthash) => isHex(contenthash))
    .optional(),
})

/**
 * The payload the owner actually signs. `expiration` is part of the signed
 * message so that it can't be swapped out for a fresh one, which would make a
 * captured signature replayable forever.
 */
export const ZodSignedName = ZodName.extend({
  expiration: z.number(),
})

export const ZodNameWithSignature = z.object({
  signature: z.object({
    hash: z.string().refine((hash) => isHex(hash)),
    message: ZodSignedName,
  }),
})

export type Name = z.infer<typeof ZodName>
export type SignedName = z.infer<typeof ZodSignedName>
export type NameWithSignature = z.infer<typeof ZodNameWithSignature>

export interface NameInKysely {
  name: string
  owner: string
  addresses: string | null // D1 doesn't support JSON yet, we'll have to parse it manually
  texts: string | null // D1 doesn't support JSON yet, we'll have to parse it manually
  contenthash: string | null
  createdAt: ColumnType<Date, never, never>
  updatedAt: ColumnType<Date, never, string | undefined>
}
