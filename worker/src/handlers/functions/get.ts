import { createKysely } from '../../d1/kysely'
import { Env } from '../../env'
import { NameData } from '../../models'
import { formatNameFromDbToNameData } from './utils'

export async function get(name: string, env: Env): Promise<NameData> {
  const db = createKysely(env)
  const record = await db
    .selectFrom('names')
    .select(['name', 'owner', 'addresses', 'texts', 'contenthash'])
    .where('name', '=', name)
    .executeTakeFirst()

  if (!record) {
    return {}
  }

  return formatNameFromDbToNameData(record)
}
