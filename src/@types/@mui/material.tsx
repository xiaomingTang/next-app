declare module '@mui/material/styles' {
  interface Theme {
    v: {
      screens: {
        desktop: number
      }
    }
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    v?: {
      screens?: {
        desktop?: number
      }
    }
  }
}

export {}
