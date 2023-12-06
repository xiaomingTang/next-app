'use client'

import EmotionProvider from './EmotionProvider'

import {
  Experimental_CssVarsProvider as ThemeProvider,
  experimental_extendTheme as createTheme,
} from '@mui/material'
import NiceModal from '@ebay/nice-modal-react'
import { SWRConfig } from 'swr'

const muiTheme = createTheme({
  v: {
    screens: {
      desktop: 1024,
    },
  },
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: '#ffffff',
          paper: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#0d1117',
          paper: '#0d1117',
        },
      },
    },
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          textTransform: 'none',
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: 'inherit',
        size: 'small',
      },
      styleOverrides: {
        root: {
          fontSize: 'inherit',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: 'bottom-start',
        enterTouchDelay: 0,
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
    MuiTypography: {
      defaultProps: {
        fontSize: 'inherit',
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        // 这个鬼东西 fontSize 不能 inherit,
        // 它应该需要 1.5em, 但是 mui 不允许设置这个值...
        // fontSize: 'inherit',
        color: 'inherit',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },
  },
})

export default function Providers({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <EmotionProvider>
        <ThemeProvider theme={muiTheme}>
          <NiceModal.Provider>{children}</NiceModal.Provider>
        </ThemeProvider>
      </EmotionProvider>
    </SWRConfig>
  )
}
