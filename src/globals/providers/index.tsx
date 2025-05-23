'use client'

// import {
//   Experimental_CssVarsProvider as ThemeProvider,
//   experimental_extendTheme as createTheme,
// } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import NiceModal from '@ebay/nice-modal-react'
import { SWRConfig } from 'swr'
import { Fade } from '@mui/material'

const muiTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
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
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
        },
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
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'normal',
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
    MuiAppBar: {
      defaultProps: {
        position: 'relative',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },
    MuiDialog: {
      defaultProps: {
        slots: {
          transition: Fade,
        },
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
      <ThemeProvider theme={muiTheme}>
        <NiceModal.Provider>{children}</NiceModal.Provider>
      </ThemeProvider>
    </SWRConfig>
  )
}
