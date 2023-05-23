import {
  Card as ThorinCard,
  Helper as ThorinHelper,
  mq,
} from '@ensdomains/thorin'
import styled, { css } from 'styled-components'

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
})(
  ({ theme }) => css`
    color: ${theme.colors.accent};
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  `
)

export const Helper = styled(ThorinHelper)`
  svg {
    display: none;
  }
`

export const Spacer = styled.div`
  display: block;
  width: 100%;
  height: 1rem;

  ${mq.sm.max(css`
    height: 0;
  `)}
`
