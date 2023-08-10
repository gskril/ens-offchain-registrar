import { Env } from '../env'

export async function getKeys(env: Env) {
  const allData = await env.RECORDS.list()
  return new Response(JSON.stringify(allData), {
    status: 200,
  })
}
