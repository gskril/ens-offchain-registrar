import { createKysely } from '../../d1/kysely'
import { Env } from '../../env'
import { NameData } from '../../models'

export async function set(name: string, records: NameData, env: Env) {
  console.log('addresses', records.addresses)
  console.log('texts', records.texts)

  const db = createKysely(env)
  await db
    .insertInto('names')
    .values({
      name,
      owner: records?.addresses?.[60] || 'unknown',
      addresses: records.addresses ? JSON.stringify(records.addresses) : null,
      texts: records.texts ? JSON.stringify(records.texts) : null,
      contenthash: records.contenthash || null,
    })
    .execute()
}
