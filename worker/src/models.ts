import { ColumnType } from 'kysely'
import z from 'zod'
import { zu } from 'zod_utilz'

export const ZodName = z.object({
  name: z.string().regex(/^[a-z0-9-.]+$/),
  owner: z.string(),
  addresses: z.record(z.string()).optional(),
  texts: z.record(z.string()).optional(),
  contenthash: z.string().optional(),
})

export const ZodNameWithSignature = z.object({
  signature: z.object({
    hash: z.string(),
    message: zu.stringToJSON().pipe(ZodName), // stringified version of ZodName
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
