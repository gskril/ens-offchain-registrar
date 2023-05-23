import { Card as ThorinCard } from '@ensdomains/thorin'
import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
`

export const Card = styled(ThorinCard)`
  width: 100%;
  align-items: center;
  gap: 1.5rem;
`

export const Link = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  color: #3888ff;
  font-weight: 500;
  text-decoration: underline;
`
