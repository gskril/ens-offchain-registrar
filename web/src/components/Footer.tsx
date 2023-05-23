import styled from 'styled-components'

import { Link } from '@/styles'

const Container = styled.footer`
  display: flex;
  gap: 1.5rem;
`

export function Footer() {
  return (
    <Container>
      <Link href="https://docs.ens.domains/dapp-developer-guide/ens-l2-offchain">
        Docs
      </Link>

      <Link href="https://github.com/gskril/ens-offchain-registrar">Repo</Link>
    </Container>
  )
}
