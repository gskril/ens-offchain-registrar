import { NameData } from '../../models/data'

export async function set(name: string, records: NameData) {
  const value = JSON.stringify(records)
  const ttl = 86_400 // 24 hours
  const expirationTtl = IS_TEMPORARY ? ttl : undefined

  try {
    await RECORDS.put(name, value, {
      expirationTtl, // Discard demo keys after TTL
      metadata: {
        updated_at: new Date().toISOString(),
        owner: records?.addresses?.[60],
      },
    })
  } catch {
    throw new Error('Error saving name')
  }
}
