import { NameData } from '../../models/data'
declare const RECORDS: KVNamespace

export async function set(name: string, records: NameData) {
  const value = JSON.stringify(records)

  try {
    await RECORDS.put(name, value, {
      metadata: {
        updated_at: new Date().toISOString(),
      },
    })
  } catch {
    throw new Error('Error saving name')
  }
}
