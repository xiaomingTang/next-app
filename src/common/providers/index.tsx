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
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                fontFamily: 'inherit',
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
