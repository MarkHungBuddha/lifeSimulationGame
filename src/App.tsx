import {
  AppBar, Toolbar, Typography, Box, Drawer, useMediaQuery, useTheme,
  IconButton,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CasinoIcon from '@mui/icons-material/Casino'
import { useState } from 'react'
import { Controls } from './components/Controls'
import { ResultPanel } from './components/ResultPanel'
import { StoryPanel } from './components/StoryPanel'
import { useGameStore } from './store/gameStore'

const DRAWER_WIDTH = 380

export function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const viewMode = useGameStore(s => s.viewMode)

  const sidebar = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', overflowY: 'auto' }}>
      <Controls />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }}
              onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <CasinoIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            蒙地卡羅人生模擬遊戲
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Block Bootstrap Retirement Simulator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, pt: '64px' } }}>
          {sidebar}
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          sx={{
            width: DRAWER_WIDTH, flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH, boxSizing: 'border-box', pt: '64px',
              borderRight: '1px solid', borderColor: 'divider',
            },
          }}>
          {sidebar}
        </Drawer>
      )}

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1, pt: '64px', minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        {viewMode === 'simulation' ? <ResultPanel /> : <StoryPanel />}
      </Box>
    </Box>
  )
}
