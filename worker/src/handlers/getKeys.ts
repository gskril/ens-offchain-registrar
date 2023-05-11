declare const RECORDS: KVNamespace

export async function getKeys() {
  const allData = await RECORDS.list()
  return new Response(JSON.stringify(allData), {
    status: 200,
  })
}
