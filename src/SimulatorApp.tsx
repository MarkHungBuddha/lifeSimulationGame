import {
  AppBar,
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import TuneIcon from '@mui/icons-material/Tune'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Controls } from './components/Controls'
import { MobileActionBar } from './components/MobileActionBar'
import { MobileQuickSetup } from './components/MobileQuickSetup'
import { ResultPanel } from './components/ResultPanel'
import { StoryPanel } from './components/StoryPanel'
import { useColorMode } from './ThemeContext'
import { useI18n } from './i18n'
import { FEATURE_FLAGS } from './config/featureFlags'
import type { UiLanguage } from './i18n/types'
import { useGameStore } from './store/gameStore'

const DRAWER_WIDTH = 380
const DRAWER_WIDTH_MOBILE = 320
const LANGUAGE_OPTIONS: UiLanguage[] = ['en', 'zh-Hant', 'ja']

const LANDING_RETIRE_AGES = [30, 40, 50, 60, 70]

function readNumberParam(params: URLSearchParams, key: string, min: number, max: number) {
  const value = Number(params.get(key))
  if (!Number.isFinite(value)) return null
  return Math.min(max, Math.max(min, value))
}

export function SimulatorApp() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchParams] = useSearchParams()
  const appliedLandingParams = useRef(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const viewMode = useGameStore((s) => s.viewMode)
  const setViewMode = useGameStore((s) => s.setViewMode)
  const setCurrentAge = useGameStore((s) => s.setCurrentAge)
  const setRetirementAge = useGameStore((s) => s.setRetirementAge)
  const setAnnualIncome = useGameStore((s) => s.setAnnualIncome)
  const setAnnualExpense = useGameStore((s) => s.setAnnualExpense)
  const setAnnualContribution = useGameStore((s) => s.setAnnualContribution)
  const setInitialPortfolio = useGameStore((s) => s.setInitialPortfolio)
  const setAllocation = useGameStore((s) => s.setAllocation)
  const setWithdrawal = useGameStore((s) => s.setWithdrawal)
  const { mode, toggle: toggleColorMode } = useColorMode()
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    if (appliedLandingParams.current) return
    appliedLandingParams.current = true

    const nextCurrentAge = readNumberParam(searchParams, 'currentAge', 20, 69)
    const retireAge = Number(searchParams.get('retireAge'))
    if (LANDING_RETIRE_AGES.includes(retireAge)) {
      setCurrentAge(nextCurrentAge == null ? Math.max(20, retireAge - 20) : Math.min(nextCurrentAge, retireAge - 1))
      setRetirementAge(retireAge)
    } else if (nextCurrentAge != null) {
      setCurrentAge(nextCurrentAge)
    }

    const annualIncome = readNumberParam(searchParams, 'annualIncome', 0, 1000000)
    const annualExpense = readNumberParam(searchParams, 'annualExpense', 0, 1000000)
    const annualContribution = readNumberParam(searchParams, 'annualContribution', 0, 1000000)
    const initialPortfolio = readNumberParam(searchParams, 'initialPortfolio', 0, 10000000)
    const stockPct = readNumberParam(searchParams, 'stockPct', 0, 100)

    if (annualIncome != null) setAnnualIncome(annualIncome)
    if (annualExpense != null) {
      setAnnualExpense(annualExpense)
      setWithdrawal({ type: 'fixed_amount', amount: annualExpense })
    }
    if (annualContribution != null) setAnnualContribution(annualContribution)
    if (initialPortfolio != null) setInitialPortfolio(initialPortfolio)
    if (stockPct != null) {
      const stockWeight = stockPct / 100
      const defensiveWeight = 1 - stockWeight
      setAllocation({
        sp500: Number((stockWeight * 0.75).toFixed(4)),
        intlStock: Number((stockWeight * 0.25).toFixed(4)),
        bond: Number((defensiveWeight * 0.8).toFixed(4)),
        gold: Number((defensiveWeight * 0.2).toFixed(4)),
        cash: 0,
        reits: 0,
      })
    }

    const lang = searchParams.get('lang')
    if (lang === 'en' || lang === 'zh-Hant' || lang === 'ja') {
      setLanguage(lang)
    }

    if (searchParams.get('autoRun') === '1') {
      window.setTimeout(() => useGameStore.getState().runSimulation(), 0)
    }
  // Apply landing query params once when the simulator opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!FEATURE_FLAGS.storyMode && viewMode === 'story') {
      setViewMode('simulation')
    }
  }, [setViewMode, viewMode])

  const drawerW = isMobile ? DRAWER_WIDTH_MOBILE : DRAWER_WIDTH

  const sidebar = (
    <Box sx={{ width: drawerW, height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', bgcolor: 'background.default' }}>
      <Controls />
    </Box>
  )

  const mobileSettings = (
    <Box sx={{ maxHeight: 'calc(100dvh - 56px)', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 2,
          py: 1,
          minHeight: 52,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TuneIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight={800} sx={{ flexGrow: 1 }}>
          {t('settings_sheet.title')}
        </Typography>
        <IconButton edge="end" aria-label={t('settings_sheet.close')} onClick={() => setSettingsOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Controls />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1.25, px: { xs: 2, sm: 3, md: 6 } }}>
          {isMobile && (
            <Button
              color="inherit"
              size="small"
              startIcon={<TuneIcon />}
              onClick={() => setSettingsOpen(true)}
              sx={{ minWidth: 0, px: 1, fontWeight: 700 }}
            >
              {t('mobile_action.adjust')}
            </Button>
          )}
          <CasinoIcon sx={{ mr: 0.5, color: 'secondary.main' }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 500, fontSize: { xs: 17, sm: 20 } }}>
            {t('app.title')}
          </Typography>
          {!isSmall && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {t('app.subtitle')}
            </Typography>
          )}
          <FormControl size="small" sx={{ minWidth: { xs: 96, sm: 132 } }}>
            <InputLabel id="language-select-label">
              {t('app.language')}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label={t('app.language')}
              onChange={(e) => setLanguage(e.target.value as UiLanguage)}
              sx={{
                color: 'text.primary',
                bgcolor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(`language_name.${option}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 0.5 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              maxHeight: 'calc(100dvh - 56px)',
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {mobileSettings}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerW,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerW,
              boxSizing: 'border-box',
              pt: '64px',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: '56px', sm: '64px' },
          pb: isMobile ? 'calc(76px + env(safe-area-inset-bottom))' : 0,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {isMobile && <MobileQuickSetup onAdjust={() => setSettingsOpen(true)} />}
        {FEATURE_FLAGS.storyMode && viewMode === 'story' ? <StoryPanel /> : <ResultPanel />}
      </Box>
      {isMobile && <MobileActionBar onAdjust={() => setSettingsOpen(true)} />}
    </Box>
  )
}
