import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { BaseError } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

import { Footer } from '@/components/Footer'
import { Button, Card, Helper, Input, Link } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import type { WorkerRequest } from '@/types'

// `||` not `??`, so a blank value in .env falls back instead of producing a
// relative URL that would POST to the frontend's own origin
const GATEWAY_URL =
  import.meta.env.VITE_GATEWAY_URL ||
  'https://ens-gateway.gregskril.workers.dev'

// Must match PARENT_NAME in the Worker's wrangler.toml, which only accepts
// writes for direct subnames of it
const PARENT_NAME = import.meta.env.VITE_PARENT_NAME || 'offchaindemo.eth'

/**
 * Drops blank entries so we never sign or submit an empty record. The gateway
 * requires every address to be a hex string, and clearing a field is how you
 * say "don't set this record" rather than "set it to an empty value".
 */
function omitEmpty(record: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value))
}

export function App() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [name, setName] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [baseAddress, setBaseAddress] = useState<string | undefined>(undefined)
  const [arbAddress, setArbAddress] = useState<string | undefined>(undefined)

  const regex = /^[a-z0-9-]+$/
  const debouncedName = useDebounce(name, 500)
  const enabled = !!debouncedName && regex.test(debouncedName)

  const register = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Wallet not connected')

      // Built once, here, so the message that gets signed is byte for byte the
      // message that gets sent. `expiration` is covered by the signature, so a
      // rebuilt message would no longer match the hash.
      const message: WorkerRequest['signature']['message'] = {
        name: `${debouncedName}.${PARENT_NAME}`,
        owner: address,
        // https://docs.ens.domains/web/resolution#multi-chain
        addresses: omitEmpty({
          '60': address,
          '2147492101': baseAddress ?? address,
          '2147525809': arbAddress ?? address,
        }),
        texts: omitEmpty({ description }),
        expiration: Date.now() + 60 * 60 * 1000, // 1 hour
      }

      const hash = await signMessageAsync({ message: JSON.stringify(message) })

      const response = await fetch(`${GATEWAY_URL}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: { hash, message },
        } satisfies WorkerRequest),
      })

      // `statusText` is empty over HTTP/2, so branch on the status code
      if (response.status === 409) {
        throw new Error('Somebody already registered that name')
      }

      if (!response.ok) {
        throw new Error('Something went wrong')
      }

      return response.json()
    },
  })

  const locked = register.isPending || register.isSuccess

  return (
    <>
      {/* Balances the footer so the card sits in the middle of the page */}
      <div aria-hidden />

      <Card>
        <ConnectButton showBalance={false} />

        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            register.mutate()
          }}
        >
          <Input
            type="text"
            label="Name"
            suffix={`.${PARENT_NAME}`}
            placeholder="ens"
            required
            disabled={locked || !address}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="text"
            label="Description"
            placeholder="Your portable web3 profile"
            disabled={locked || !address}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            type="text"
            label="ETH Address"
            value={address ?? ''}
            disabled
            readOnly
          />

          <Input
            type="text"
            label="Base Address"
            value={baseAddress ?? address ?? ''}
            disabled={locked || !address}
            onChange={(e) => setBaseAddress(e.target.value)}
          />

          <Input
            type="text"
            label="Arb Address"
            value={arbAddress ?? address ?? ''}
            disabled={locked || !address}
            onChange={(e) => setArbAddress(e.target.value)}
          />

          <Button
            type="submit"
            disabled={!enabled || locked}
            loading={register.isPending}
          >
            Register
          </Button>
        </form>

        {register.error ? (
          <Helper type="error">
            {/* viem errors stringify to a multi-line blob, so prefer the short form */}
            {register.error instanceof BaseError
              ? register.error.shortMessage
              : register.error.message}
          </Helper>
        ) : register.isSuccess ? (
          <Helper>
            <p>
              Visit the{' '}
              <Link href={`https://ens.app/${debouncedName}.${PARENT_NAME}`}>
                ENS Manager
              </Link>{' '}
              to see your name
            </p>
          </Helper>
        ) : debouncedName && !enabled ? (
          <Helper type="error">Name must be lowercase alphanumeric</Helper>
        ) : null}
      </Card>

      <Footer />
    </>
  )
}
