import { NameData } from '../../models/data'
declare const RECORDS: KVNamespace

export async function get(name: string): Promise<NameData> {
  const kvValue = await RECORDS.get(name)

  if (kvValue === null) {
    return {}
  }

  const records = JSON.parse(kvValue) as NameData
  return records
}
