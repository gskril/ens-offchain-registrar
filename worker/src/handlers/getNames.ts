import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { parseNameFromDb } from './functions/utils'

export async function getNames(env: Env) {
  const db = createKysely(env)
  const allData = await db.selectFrom('names').selectAll().execute()

  return Response.json(parseNameFromDb(allData), {
    status: 200,
  })
}
