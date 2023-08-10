import { Database } from '../../d1/kysely'
import { NameData } from '../../models'

type FlatName = Omit<Database['names'], 'createdAt' | 'updatedAt'>
type NameDataWithName = NameData & { name: string }

export function formatNameFromDbToNameData(flatName: FlatName): NameDataWithName

export function formatNameFromDbToNameData(
  flatName: FlatName[]
): NameDataWithName[]

export function formatNameFromDbToNameData(
  flatName: FlatName | FlatName[]
): NameDataWithName | NameDataWithName[] {
  if (Array.isArray(flatName)) {
    return flatName.map(formatName)
  }

  return formatName(flatName)

  function formatName(name: FlatName): NameDataWithName {
    return {
      name: name.name,
      addresses: name.addresses ? JSON.parse(name.addresses) : undefined,
      texts: name.texts ? JSON.parse(name.texts) : undefined,
      contenthash: name.contenthash || undefined,
    }
  }
}
