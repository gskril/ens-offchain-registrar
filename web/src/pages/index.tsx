import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

import { WorkerRequest } from '@/types'

import useDebounce from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'

export default function App() {
  const { address } = useAccount()
  const [name, setName] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const debouncedName = useDebounce(name, 500)

  const regex = new RegExp('^[a-z0-9-]+$')
  const enabled = !!debouncedName && regex.test(debouncedName)

  const { data, signMessage, variables } = useSignMessage()

  const requestBody: WorkerRequest = {
    name: `${debouncedName}.conference.eth`,
    records: {
      addresses: {
        60: address,
      },
      text: {
        description: description,
      },
    },
    signature: {
      hash: data,
      message: variables?.message,
    },
  }

  const { data: gatewayData, error: gatewayError } = useFetch(
    data && '/api/register',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  )

  return (
    <main>
      <div className="container">
        <ConnectButton showBalance={false} />

        <form
          onSubmit={(e) => {
            e.preventDefault()
            signMessage({
              message: `Register ${debouncedName}.conference.eth on Goerli`,
            })
          }}
        >
          <input
            type="text"
            required
            disabled={!!data}
            placeholder="name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            disabled={!!data}
            placeholder="description"
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit" disabled={!enabled || !!data}>
            Sign Message
          </button>

          {gatewayError ? (
            <p>Something went wrong :/</p>
          ) : gatewayData ? (
            <p>
              Visit{' '}
              <a
                href={`https://app.ens.domains/${debouncedName}.conference.eth`}
                target="_blank"
              >
                app.ens.domains/{debouncedName}.conference.eth
              </a>{' '}
              on Goerli to see your name! It might take a minute.
            </p>
          ) : !debouncedName ? (
            <p>Enter a name to use as a subname of conference.eth on Goerli</p>
          ) : enabled ? (
            <p>
              Sign a message to register {debouncedName}.conference.eth on
              Goerli
            </p>
          ) : (
            <p>Pick a name with just letters and numbers</p>
          )}
        </form>
      </div>
    </main>
  )
}
