import { CamelCasePlugin, Generated, Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

import { Env } from '../env'
import { NameData } from '../models'

export interface Database {
  names: {
    name: string
    owner: string
    texts: string | null
    addresses: string | null
    contenthash: string | null
    createdAt: Generated<string>
    updatedAt: Generated<string>
  }
}

export function createKysely(env: Env): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: env.D1 }),
    plugins: [new CamelCasePlugin()],
  })
}
