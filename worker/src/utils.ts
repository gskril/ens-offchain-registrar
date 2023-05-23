import { Buffer } from 'buffer'

export function decodeDnsName(dnsname: Buffer) {
  const labels = []
  let idx = 0
  while (true) {
    const len = dnsname.readUInt8(idx)
    if (len === 0) break
    labels.push(dnsname.slice(idx + 1, idx + len + 1).toString('utf8'))
    idx += len + 1
  }
  return labels.join('.')
}

export function getFunctionSelector(calldata: string): string {
  return calldata.slice(0, 10).toLowerCase()
}

export function buildResponse(
  status: number,
  body: Record<string, unknown>
): Response {
  const response = {
    type: 'object',
    properties: body,
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
