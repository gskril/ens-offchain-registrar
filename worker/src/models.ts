import { ColumnType } from 'kysely'
import { isAddress, isHex } from 'viem'
import z from 'zod'

export const ZodName = z.object({
  name: z.string().regex(/^[a-z0-9-.]+$/),
  owner: z.string().refine((owner) => isAddress(owner)),
  addresses: z.record(z.string().refine((addr) => isHex(addr))).optional(),
  texts: z.record(z.string()).optional(),
  contenthash: z
    .string()
    .refine((contenthash) => isHex(contenthash))
    .optional(),
})

export const ZodNameWithSignature = z.object({
  signature: z.object({
    hash: z.string().refine((hash) => isHex(hash)),
    message: ZodName,
  }),
  expiration: z.number(),
})

export type Name = z.infer<typeof ZodName>
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
