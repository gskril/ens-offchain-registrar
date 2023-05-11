import './App.css'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage } from 'wagmi'
import { useState } from 'react'

import useDebounce from './hooks/useDebounce'
import { useFetch } from './hooks/useFetch'

function App() {
  const { address } = useAccount()
  const [name, setName] = useState<string | null>(null)
  const debouncedName = useDebounce(name, 500)

  const regex = new RegExp('^[a-z0-9-]+$')
  const enabled = !!debouncedName && regex.test(debouncedName)

  const { data, signMessage, variables } = useSignMessage()

  const { data: gatewayData, error: gatewayError } = useFetch(
    data && 'https://ens-gateway.gregskril.workers.dev/set',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${debouncedName}.conference.eth`,
        records: {
          addresses: {
            '60': address,
          },
        },
        signature: '',
      }),
    }
  )

  {
    gatewayData && console.log(gatewayData)
  }

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
            disabled={!!data}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" disabled={!enabled}>
            Sign Message
          </button>

          {gatewayError ? (
            <p>Error saving your data to the gateway</p>
          ) : gatewayData ? (
            <p>
              Got the gateway data! Go to{' '}
              <a
                href={`https://app.ens.domains/${debouncedName}.conference.eth`}
              >
                app.ens.domains/{debouncedName}.conference.eth
              </a>{' '}
              on Goerli to see if it worked
            </p>
          ) : !debouncedName ? (
            <p>Enter a name to use as a subname of conference.eth on Goerli</p>
          ) : enabled ? (
            <p>
              Sign a message to register {debouncedName}.conference.eth on
              Goerli
            </p>
          ) : (
            <p>That name doesn't work</p>
          )}
        </form>
      </div>
    </main>
  )
}

export default App
