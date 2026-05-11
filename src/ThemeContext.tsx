import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

type ColorMode = 'light' | 'dark'

const landingPalette = {
  bg: '#fafaf7',
  paper: '#fffdf8',
  ink: '#0a0a0a',
  inkSoft: '#4a4a4a',
  inkFaint: '#6f6f6f',
  line: 'rgba(10, 10, 10, 0.12)',
  accent: '#c8392f',
  success: '#2a6d3a',
  warning: '#9b5f15',
  danger: '#a92f28',
}

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
      primary: {
        main: mode === 'light' ? landingPalette.ink : '#f5f1e8',
        contrastText: mode === 'light' ? landingPalette.bg : '#111',
      },
      secondary: {
        main: landingPalette.accent,
        contrastText: '#fff',
      },
      success: { main: landingPalette.success },
      warning: { main: landingPalette.warning },
      error: { main: landingPalette.danger },
      divider: mode === 'light' ? landingPalette.line : 'rgba(245, 241, 232, 0.16)',
      text: mode === 'light'
        ? {
            primary: landingPalette.ink,
            secondary: landingPalette.inkSoft,
            disabled: landingPalette.inkFaint,
          }
        : {
            primary: '#f5f1e8',
            secondary: '#c9c2b6',
            disabled: '#8f887e',
          },
      ...(mode === 'light'
        ? { background: { default: landingPalette.bg, paper: landingPalette.paper } }
        : { background: { default: '#11100e', paper: '#1a1815' } }
      ),
      action: {
        hover: mode === 'light' ? 'rgba(10, 10, 10, 0.04)' : 'rgba(245, 241, 232, 0.06)',
        selected: mode === 'light' ? 'rgba(200, 57, 47, 0.08)' : 'rgba(200, 57, 47, 0.18)',
        disabledBackground: mode === 'light' ? 'rgba(10, 10, 10, 0.08)' : 'rgba(245, 241, 232, 0.08)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Noto Sans TC", "Noto Sans JP", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 400, letterSpacing: 0 },
      h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 400, letterSpacing: 0 },
      h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 400, letterSpacing: 0 },
      h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 500, letterSpacing: 0 },
      h5: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 500, letterSpacing: 0 },
      h6: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 500, letterSpacing: 0 },
      subtitle1: { fontWeight: 600, letterSpacing: 0 },
      subtitle2: { fontWeight: 600, letterSpacing: 0 },
      button: { fontWeight: 600, letterSpacing: 0, textTransform: 'none' },
      overline: {
        fontFamily: '"JetBrains Mono", "Noto Sans TC", monospace',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      },
      caption: { letterSpacing: 0 },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '::selection': {
            background: mode === 'light' ? landingPalette.ink : '#f5f1e8',
            color: mode === 'light' ? landingPalette.bg : '#11100e',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(250, 250, 247, 0.94)' : 'rgba(17, 16, 14, 0.94)',
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            backdropFilter: 'blur(12px)',
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.default,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            boxShadow: 'none',
            minHeight: 36,
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: ({ theme }) => ({
            backgroundColor: theme.palette.text.primary,
            color: theme.palette.background.default,
            '&:hover': { backgroundColor: landingPalette.accent },
          }),
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            borderRadius: 0,
            '&.Mui-selected': {
              color: theme.palette.background.default,
              backgroundColor: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: landingPalette.accent,
              },
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
          rail: {
            opacity: 0.18,
          },
          thumb: {
            width: 14,
            height: 14,
            boxShadow: 'none',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px rgba(200, 57, 47, 0.12)`,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 0,
            backgroundColor: theme.palette.background.paper,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.text.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: landingPalette.accent,
              borderWidth: 1,
            },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            '&.Mui-focused': { color: landingPalette.accent },
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontFamily: '"JetBrains Mono", "Noto Sans TC", monospace',
            fontWeight: 500,
            letterSpacing: '0.04em',
          },
        },
      },
    },
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
