import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

type ColorMode = 'light' | 'dark'

const ColorModeContext = createContext<{ mode: ColorMode; toggle: () => void }>({
  mode: 'light',
  toggle: () => {},
})

export const useColorMode = () => useContext(ColorModeContext)

function getStoredMode(): ColorMode {
  try {
    const v = localStorage.getItem('colorMode')
    if (v === 'dark' || v === 'light') return v
  } catch { /* noop */ }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(getStoredMode)

  const toggle = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      try { localStorage.setItem('colorMode', next) } catch { /* noop */ }
      return next
    })
  }

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#1565c0' },
      secondary: { main: '#2e7d32' },
      ...(mode === 'light'
        ? { background: { default: '#f5f5f5', paper: '#fff' } }
        : { background: { default: '#121212', paper: '#1e1e1e' } }
      ),
    },
    typography: {
      fontFamily: '"Noto Sans TC", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: { borderRadius: 12 },
  }), [mode])

  const ctx = useMemo(() => ({ mode, toggle }), [mode])

  return (
    <ColorModeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
