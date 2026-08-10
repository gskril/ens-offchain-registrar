import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

import { Footer } from '@/components/Footer'
import { Button, Card, Helper, Input, Link } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import type { WorkerRequest } from '@/types'

const GATEWAY_URL =
  import.meta.env.VITE_GATEWAY_URL ??
  'https://ens-gateway.gregskril.workers.dev'

export function App() {
  const { address } = useAccount()

  const [name, setName] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [baseAddress, setBaseAddress] = useState<string | undefined>(address)
  const [arbAddress, setArbAddress] = useState<string | undefined>(address)

  const regex = /^[a-z0-9-]+$/
  const debouncedName = useDebounce(name, 500)
  const enabled = !!debouncedName && regex.test(debouncedName)

  const { data, isPending, signMessage } = useSignMessage()

  const nameData: WorkerRequest['signature']['message'] = {
    name: `${debouncedName}.offchaindemo.eth`,
    owner: address!,
    // https://docs.ens.domains/web/resolution#multi-chain
    addresses: {
      '60': address,
      '2147492101': baseAddress,
      '2147525809': arbAddress,
    },
    texts: { description },
  }

  const requestBody: WorkerRequest = {
    signature: {
      hash: data!,
      message: nameData,
    },
    expiration: Date.now() + 60 * 60 * 1000, // 1 hour
  }

  const {
    data: gatewayData,
    error: gatewayError,
    isLoading: gatewayIsLoading,
  } = useFetch(data && `${GATEWAY_URL}/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  return (
    <>
      {/* Balances the footer so the card sits in the middle of the page */}
      <div aria-hidden />

      <Card>
        <ConnectButton showBalance={false} />

        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            signMessage({ message: JSON.stringify(nameData) })
          }}
        >
          <Input
            type="text"
            label="Name"
            suffix=".offchaindemo.eth"
            placeholder="ens"
            required
            disabled={!!data || !address}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="text"
            label="Description"
            placeholder="Your portable web3 profile"
            disabled={!!data || !address}
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
            defaultValue={address}
            disabled={!!data || !address}
            onChange={(e) => setBaseAddress(e.target.value)}
          />

          <Input
            type="text"
            label="Arb Address"
            defaultValue={address}
            disabled={!!data || !address}
            onChange={(e) => setArbAddress(e.target.value)}
          />

          <Button
            type="submit"
            disabled={!enabled || !!data}
            loading={isPending || gatewayIsLoading}
          >
            Register
          </Button>
        </form>

        {gatewayError ? (
          <Helper type="error">
            {gatewayError.message === 'Conflict'
              ? 'Somebody already registered that name'
              : 'Something went wrong'}
          </Helper>
        ) : gatewayData ? (
          <Helper>
            <p>
              Visit the{' '}
              <Link href={`https://ens.app/${debouncedName}.offchaindemo.eth`}>
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
