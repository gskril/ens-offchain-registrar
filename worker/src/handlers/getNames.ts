import { createKysely } from '../d1/kysely'
import { Env } from '../env'
import { formatNameFromDbToNameData } from './functions/utils'

export async function getNames(env: Env) {
  const db = createKysely(env)
  const allData = await db
    .selectFrom('names')
    .select(['name', 'owner', 'addresses', 'texts', 'contenthash'])
    .execute()

  return Response.json(formatNameFromDbToNameData(allData), {
    status: 200,
  })
}
