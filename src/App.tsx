import {
  AppBar,
  Box,
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
import MenuIcon from '@mui/icons-material/Menu'
import CasinoIcon from '@mui/icons-material/Casino'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useState } from 'react'
import { Controls } from './components/Controls'
import { ResultPanel } from './components/ResultPanel'
import { StoryPanel } from './components/StoryPanel'
import { useColorMode } from './ThemeContext'
import { useGameStore } from './store/gameStore'
import { useI18n } from './i18n'
import type { UiLanguage } from './i18n/types'

const DRAWER_WIDTH = 380
const DRAWER_WIDTH_MOBILE = 320

const COPY: Record<UiLanguage, { title: string; subtitle: string; language: string }> = {
  en: {
    title: 'Life Simulation Game',
    subtitle: 'Block Bootstrap Retirement Simulator',
    language: 'Language',
  },
  zh: {
    title: '人生模擬遊戲',
    subtitle: '區塊自助法退休模擬器',
    language: '語言',
  },
  ja: {
    title: 'ライフシミュレーションゲーム',
    subtitle: 'ブロック・ブートストラップ退職シミュレーター',
    language: '言語',
  },
}

const LANGUAGE_LABELS: Record<UiLanguage, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
}

export function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const viewMode = useGameStore((s) => s.viewMode)
  const { mode, toggle: toggleColorMode } = useColorMode()
  const { language, setLanguage } = useI18n()
  const copy = COPY[language]

  const drawerW = isMobile ? DRAWER_WIDTH_MOBILE : DRAWER_WIDTH

  const sidebar = (
    <Box sx={{ width: drawerW, height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Controls />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" sx={{ mr: 0.5 }} onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <CasinoIcon sx={{ mr: 0.5 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>
            {copy.title}
          </Typography>
          {!isSmall && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {copy.subtitle}
            </Typography>
          )}
          <FormControl size="small" sx={{ minWidth: { xs: 96, sm: 118 } }}>
            <InputLabel id="language-select-label" sx={{ color: 'inherit' }}>
              {copy.language}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label={copy.language}
              onChange={(e) => setLanguage(e.target.value as UiLanguage)}
              sx={{
                color: 'inherit',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' },
                '& .MuiSvgIcon-root': { color: 'inherit' },
              }}
            >
              <MenuItem value="en">{LANGUAGE_LABELS.en}</MenuItem>
              <MenuItem value="zh">{LANGUAGE_LABELS.zh}</MenuItem>
              <MenuItem value="ja">{LANGUAGE_LABELS.ja}</MenuItem>
            </Select>
          </FormControl>
          <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 0.5 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: drawerW, pt: { xs: '56px', sm: '64px' } } }}
        >
          {sidebar}
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
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {viewMode === 'simulation' ? <ResultPanel /> : <StoryPanel />}
      </Box>
    </Box>
  )
}
