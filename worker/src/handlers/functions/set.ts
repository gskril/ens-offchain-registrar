import { NameData } from '../../models/data'
declare const RECORDS: KVNamespace

export async function set(
  name: string,
  records: NameData,
  isTemporary?: boolean
) {
  const value = JSON.stringify(records)
  const ttl = 3_600 // 1 hour
  const expirationTtl = isTemporary ? ttl : undefined

  try {
    await RECORDS.put(name, value, {
      expirationTtl, // Discard demo keys after TTL
      metadata: {
        updated_at: new Date().toISOString(),
      },
    })
  } catch {
    throw new Error('Error saving name')
  }
}
