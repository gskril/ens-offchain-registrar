import './App.css'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage } from 'wagmi'
import { useState } from 'react'

import useDebounce from './hooks/useDebounce'
import { useFetch } from './hooks/useFetch'

function App() {
  const { address } = useAccount()
  const [name, setName] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const debouncedName = useDebounce(name, 500)

  const regex = new RegExp('^[a-z0-9-]+$')
  const enabled = !!debouncedName && regex.test(debouncedName)

  const { data, signMessage, variables } = useSignMessage()

  const { data: gatewayData, error: gatewayError } = useFetch(
    data && 'https://ens-gateway.gregskril.workers.dev/set',
    {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${debouncedName}.conference.eth`,
        records: {
          addresses: {
            '60': address,
          },
          text: {
            description: description,
          },
        },
        signature: {
          hash: data,
          message: variables?.message,
        },
      }),
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

          {gatewayData || gatewayError ? (
            <p>
              Go to{' '}
              <a
                href={`https://app.ens.domains/${debouncedName}.conference.eth`}
                target="_blank"
              >
                app.ens.domains/{debouncedName}.conference.eth
              </a>{' '}
              on Goerli to see if it worked. It might take a minute.
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

export default App
