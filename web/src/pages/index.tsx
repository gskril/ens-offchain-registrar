import { Button, Input } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

import { Footer } from '@/components/Footer'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import { Card, Form, Helper, Link, Spacer } from '@/styles'
import { WorkerRequest } from '@/types'

export default function App() {
  const { address } = useAccount()

  const [name, setName] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [baseAddress, setBaseAddress] = useState<string | undefined>(address)
  const [arbAddress, setArbAddress] = useState<string | undefined>(address)

  const regex = new RegExp('^[a-z0-9-]+$')
  const debouncedName = useDebounce(name, 500)
  const enabled = !!debouncedName && regex.test(debouncedName)

  const { data, isPending, signMessage, variables } = useSignMessage()

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
    expiration: new Date().getTime() + 60 * 60, // 1 hour
  }

  const {
    data: gatewayData,
    error: gatewayError,
    isLoading: gatewayIsLoading,
  } = useFetch(data && 'https://ens-gateway.gregskril.workers.dev/set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  return (
    <>
      <Head>
        <title>Offchain ENS Registrar</title>
        <meta property="og:title" content="Offchain ENS Registrar" />
        <meta
          name="description"
          content="Quick demo of how offchain ENS names work"
        />
        <meta
          property="og:description"
          content="Quick demo of how offchain ENS names work"
        />
      </Head>

      <Spacer />

      <Card>
        <ConnectButton showBalance={false} />

        <Form
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
            defaultValue={address}
            disabled
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
        </Form>

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
        ) : !!debouncedName && !enabled ? (
          <Helper type="error">Name must be lowercase alphanumeric</Helper>
        ) : null}
      </Card>

      <Footer />
    </>
  )
}
