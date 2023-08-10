import { Env } from '../../env'
import { NameData } from '../../models/data'

export async function get(name: string, env: Env): Promise<NameData> {
  const kvValue = await env.RECORDS.get(name)

  if (kvValue === null) {
    return {}
  }

  const records = JSON.parse(kvValue) as NameData
  return records
}
