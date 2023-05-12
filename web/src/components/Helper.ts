import { Helper as ThorinHelper } from '@ensdomains/thorin'
import styled, { css } from 'styled-components'

export const Helper = styled(ThorinHelper)<{
  success?: boolean
}>(
  ({ theme, success }) => css`
    ${success === true &&
    css`
      border-color: ${theme.colors.green};
      background-color: ${theme.colors.greenSurface};
    `}

    svg {
      display: none;
    }
  `
)
