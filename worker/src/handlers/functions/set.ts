import { Env } from '../../env'
import { NameData } from '../../models/data'

export async function set(name: string, records: NameData, env: Env) {
  const value = JSON.stringify(records)
  const ttl = 86_400 // 24 hours
  const expirationTtl = env.IS_TEMPORARY ? ttl : undefined

  try {
    await env.RECORDS.put(name, value, {
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
