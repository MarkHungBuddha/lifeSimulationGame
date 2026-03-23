import {
  AppBar, Toolbar, Typography, Box, Drawer, useMediaQuery, useTheme,
  IconButton,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CasinoIcon from '@mui/icons-material/Casino'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useState } from 'react'
import { Controls } from './components/Controls'
import { ResultPanel } from './components/ResultPanel'
import { StoryPanel } from './components/StoryPanel'
import { useGameStore } from './store/gameStore'
import { useColorMode } from './ThemeContext'

const DRAWER_WIDTH = 380
const DRAWER_WIDTH_MOBILE = 320

export function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const viewMode = useGameStore(s => s.viewMode)
  const { mode, toggle: toggleColorMode } = useColorMode()

  const drawerW = isMobile ? DRAWER_WIDTH_MOBILE : DRAWER_WIDTH

  const sidebar = (
    <Box sx={{ width: drawerW, height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Controls />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }}
              onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <CasinoIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>
            蒙地卡羅人生模擬遊戲
          </Typography>
          {!isSmall && (
            <Typography variant="caption" sx={{ opacity: 0.7, mr: 1 }}>
              Block Bootstrap Retirement Simulator
            </Typography>
          )}
          <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 0.5 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: drawerW, pt: { xs: '56px', sm: '64px' } } }}>
          {sidebar}
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          sx={{
            width: drawerW, flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerW, boxSizing: 'border-box', pt: '64px',
              borderRight: '1px solid', borderColor: 'divider',
            },
          }}>
          {sidebar}
        </Drawer>
      )}

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1, pt: { xs: '56px', sm: '64px' }, minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        {viewMode === 'simulation' ? <ResultPanel /> : <StoryPanel />}
      </Box>
    </Box>
  )
}
