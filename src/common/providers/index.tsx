'use client'

import EmotionProvider from './EmotionProvider'

import { usePrefersColorSchema } from '../contexts/PrefersColorSchema'

import { ThemeProvider, createTheme } from '@mui/material'
import { useMemo } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { SWRConfig } from 'swr'

function useMuiTheme() {
  const { mode } = usePrefersColorSchema()
  const muiTheme = useMemo(
    () =>
      createTheme({
        v: {
          screens: {
            desktop: 1024,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                fontFamily: 'inherit',
              },
            },
          },
          MuiTooltip: {
            defaultProps: {
              placement: 'bottom-start',
            },
          },
          MuiChip: {
            defaultProps: {
              size: 'small',
              color: 'default',
            },
            styleOverrides: {
              root: {
                fontFamily: 'inherit',
                fontSize: '0.75rem',
              },
            },
          },
        },
        palette: {
          mode,
        },
      }),
    [mode]
  )
  return muiTheme
}

export default function Providers({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  const theme = useMuiTheme()
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <EmotionProvider>
        <ThemeProvider theme={theme}>
          <NiceModal.Provider>{children}</NiceModal.Provider>
        </ThemeProvider>
      </EmotionProvider>
    </SWRConfig>
  )
}
