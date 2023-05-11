import { NameData } from '../models/data'
declare const RECORDS: KVNamespace

export async function set(name: string, records: NameData): Promise<Response> {
  const value = JSON.stringify(records)

  try {
    await RECORDS.put(name, value, {
      metadata: {
        updated_at: new Date().toISOString(),
      },
    })
    const response = new Response(`Successfully set ${name} to ${value}`, {
      status: 200,
    })
    return response
  } catch (err) {
    const response = new Response(`Error setting key ${name}: ${err}`, {
      status: 500,
    })
    return response
  }
}
