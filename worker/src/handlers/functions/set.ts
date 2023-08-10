import { createKysely } from '../../d1/kysely'
import { Env } from '../../env'
import { NameData } from '../../models'

export async function set(name: string, records: NameData, env: Env) {
  const db = createKysely(env)
  const body = {
    name,
    owner: records?.addresses?.[60] || 'unknown',
    addresses: records.addresses ? JSON.stringify(records.addresses) : null,
    texts: records.texts ? JSON.stringify(records.texts) : null,
    contenthash: records.contenthash || null,
  }

  await db
    .insertInto('names')
    .values(body)
    .onConflict((oc) => oc.column('name').doUpdateSet(body))
    .execute()
}
