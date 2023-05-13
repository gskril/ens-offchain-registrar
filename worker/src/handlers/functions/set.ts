import { NameData } from '../../models/data'
declare const RECORDS: KVNamespace

export async function set(
  name: string,
  records: NameData,
  isTemporary?: boolean
) {
  const value = JSON.stringify(records)

  try {
    await RECORDS.put(name, value, {
      expirationTtl: isTemporary ? 86_400 : undefined, // Discard demo keys after 24 hours
      metadata: {
        updated_at: new Date().toISOString(),
      },
    })
  } catch {
    throw new Error('Error saving name')
  }
}
