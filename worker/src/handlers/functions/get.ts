import { NameData } from '../../models/data'

export async function get(name: string): Promise<NameData | null> {
  const kvValue = await RECORDS.get(name)

  if (kvValue === null) {
    return null
  }

  const records = JSON.parse(kvValue) as NameData
  return records
}
