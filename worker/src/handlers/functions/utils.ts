import { Insertable, Selectable } from 'kysely'

import { Name, NameInKysely } from '../../models'

type SelectableKysely = Selectable<NameInKysely>
type InsertableKysely = Insertable<NameInKysely>

/**
 * Parse `texts` and `addresses` from the database into JSON.
 * @param flatName Name from the database
 */
export function parseNameFromDb(flatName: SelectableKysely): Name
export function parseNameFromDb(flatName: SelectableKysely[]): Name[]
export function parseNameFromDb(
  flatName: SelectableKysely | SelectableKysely[]
): Name | Name[] {
  if (Array.isArray(flatName)) {
    return flatName.map(parseName)
  }

  return parseName(flatName)

  function parseName(name: SelectableKysely) {
    return {
      name: name.name,
      owner: name.owner,
      addresses: name.addresses ? JSON.parse(name.addresses) : undefined,
      texts: name.texts ? JSON.parse(name.texts) : undefined,
      contenthash: name.contenthash || undefined,
      createdAt: name.createdAt,
      updatedAt: name.updatedAt,
    }
  }
}

/**
 * Stringify `texts` and `addresses` from JSON.
 * @param name Name to be inserted into the database
 */
export function stringifyNameForDb(name: Name): InsertableKysely
export function stringifyNameForDb(name: Name[]): InsertableKysely[]
export function stringifyNameForDb(
  name: Name | Name[]
): InsertableKysely | InsertableKysely[] {
  if (Array.isArray(name)) {
    return name.map(stringifyName)
  }

  return stringifyName(name)

  function stringifyName(name: Name) {
    return {
      name: name.name,
      owner: name.owner,
      addresses: name.addresses ? JSON.stringify(name.addresses) : null,
      texts: name.texts ? JSON.stringify(name.texts) : null,
      contenthash: name.contenthash || null,
      updatedAt: new Date().toISOString(),
    }
  }
}
