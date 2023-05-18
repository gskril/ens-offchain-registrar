export async function getOffchainLookup() {
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
