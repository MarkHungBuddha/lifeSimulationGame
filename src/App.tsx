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
import { useEffect, useState } from 'react'
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

export function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const viewMode = useGameStore((s) => s.viewMode)
  const setViewMode = useGameStore((s) => s.setViewMode)
  const { mode, toggle: toggleColorMode } = useColorMode()
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    if (!FEATURE_FLAGS.storyMode && viewMode === 'story') {
      setViewMode('simulation')
    }
  }, [setViewMode, viewMode])

  const drawerW = isMobile ? DRAWER_WIDTH_MOBILE : DRAWER_WIDTH

  const sidebar = (
    <Box sx={{ width: drawerW, height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
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
          <CasinoIcon sx={{ mr: 0.5 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>
            {t('app.title')}
          </Typography>
          {!isSmall && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {t('app.subtitle')}
            </Typography>
          )}
          <FormControl size="small" sx={{ minWidth: { xs: 96, sm: 132 } }}>
            <InputLabel id="language-select-label" sx={{ color: 'inherit' }}>
              {t('app.language')}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label={t('app.language')}
              onChange={(e) => setLanguage(e.target.value as UiLanguage)}
              sx={{
                color: 'inherit',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
                '& .MuiSvgIcon-root': { color: 'inherit' },
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
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              maxHeight: 'calc(100dvh - 56px)',
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
