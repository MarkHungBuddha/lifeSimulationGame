/**
 * 人生故事面板
 *
 * 跑一次模擬路徑，以時間線方式展示：
 * - 每年的資產走勢
 * - 觸發的隨機事件（什麼年齡發生了什麼事）
 * - 事件對財務的影響
 */

import {
  Box, Typography, Paper, Chip, Stack,
  useTheme,
} from '@mui/material'
import {
  Timeline, TimelineItem, TimelineContent, TimelineSeparator,
  TimelineDot, TimelineConnector,
} from '@mui/lab'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import CakeIcon from '@mui/icons-material/Cake'
import type { EventCategory } from '../events/eventTypes'
import { CATEGORY_LABELS } from '../events/eventDatabase'
import { useGameStore } from '../store/gameStore'

const CATEGORY_COLORS: Record<EventCategory, string> = {
  market: '#1565c0',
  career: '#6a1b9a',
  health: '#c62828',
  family: '#2e7d32',
  property: '#e65100',
  legal: '#37474f',
}

const CATEGORY_EMOJI: Record<EventCategory, string> = {
  market: '📉',
  career: '💼',
  health: '🏥',
  family: '👨‍👩‍👧',
  property: '🏠',
  legal: '⚖️',
}

function formatMoney(n: number): string {
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '-'
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function formatPortfolio(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function StoryPanel() {
  const storyResult = useGameStore(s => s.storyResult)
  const currentAge = useGameStore(s => s.currentAge)
  const retirementAge = useGameStore(s => s.retirementAge)

  if (!storyResult) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '80vh', color: 'text.disabled',
      }}>
        <AutoStoriesIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
        <Typography variant="h5">按「生成人生故事」開始</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          將模擬一次完整人生，展示每年發生的隨機事件
        </Typography>
      </Box>
    )
  }

  const { snapshots, bankrupt, bankruptAge, finalPortfolio, allEvents } = storyResult
  const totalYears = snapshots.length

  // 統計
  const positiveEvents = allEvents.filter(e => e.event.isPositive)
  const negativeEvents = allEvents.filter(e => !e.event.isPositive)
  const peakPortfolio = Math.max(...snapshots.map(s => s.portfolioEnd))
  const peakAge = snapshots.find(s => s.portfolioEnd === peakPortfolio)?.age ?? 0

  // 篩選有事件的年份 + 關鍵年份（退休、破產、第一年、最後一年、資產最高）
  const keyYears = new Set<number>()
  keyYears.add(0)
  keyYears.add(totalYears - 1)
  keyYears.add(retirementAge - currentAge)
  if (bankruptAge) keyYears.add(bankruptAge - currentAge)
  keyYears.add(peakAge - currentAge)
  snapshots.forEach((s, i) => { if (s.events.length > 0) keyYears.add(i) })

  // 每 5 年也加入
  for (let i = 0; i < totalYears; i += 5) keyYears.add(i)

  const sortedYears = [...keyYears].filter(y => y >= 0 && y < totalYears).sort((a, b) => a - b)

  return (
    <Box sx={{ p: 3 }}>
      {/* 結局 Hero */}
      <Paper elevation={2} sx={{
        p: 3, mb: 3, textAlign: 'center',
        background: bankrupt
          ? 'linear-gradient(135deg, #d32f2f11, #d32f2f08)'
          : 'linear-gradient(135deg, #2e7d3211, #2e7d3208)',
        border: bankrupt ? '1px solid #d32f2f33' : '1px solid #2e7d3233',
      }}>
        <Typography variant="h3" fontWeight={800}
          color={bankrupt ? 'error.main' : 'success.main'}>
          {bankrupt ? `${bankruptAge} 歲破產` : '財務存活'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          最終資產 {formatPortfolio(finalPortfolio)}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Chip label={`${allEvents.length} 個事件`} variant="outlined" />
          <Chip label={`${positiveEvents.length} 正面`} color="success" variant="outlined" />
          <Chip label={`${negativeEvents.length} 負面`} color="error" variant="outlined" />
          <Chip label={`峰值 ${formatPortfolio(peakPortfolio)} @ ${peakAge}歲`} variant="outlined" />
        </Stack>
      </Paper>

      {/* 資產走勢迷你圖 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          資產走勢
        </Typography>
        <StoryChart snapshots={snapshots} currentAge={currentAge} retirementAge={retirementAge} />
      </Paper>

      {/* 時間線 */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          人生時間線
        </Typography>

        <Timeline position="right" sx={{
          p: 0,
          '& .MuiTimelineItem-root:before': { display: 'none' },
        }}>
          {sortedYears.map((yearIdx, i) => {
            const snap = snapshots[yearIdx]
            const age = snap.age
            const hasEvents = snap.events.length > 0
            const isRetirement = age === retirementAge
            const isBankrupt = bankrupt && age === bankruptAge
            const isPeak = age === peakAge
            const isLast = yearIdx === totalYears - 1

            let dotColor: 'success' | 'error' | 'primary' | 'warning' | 'grey' = 'grey'
            if (isBankrupt) dotColor = 'error'
            else if (isRetirement) dotColor = 'primary'
            else if (hasEvents) dotColor = 'warning'
            else if (isPeak) dotColor = 'success'

            return (
              <TimelineItem key={yearIdx}>
                <TimelineSeparator>
                  <TimelineDot color={dotColor} variant={hasEvents ? 'filled' : 'outlined'}>
                    {isRetirement ? <CakeIcon sx={{ fontSize: 14 }} /> :
                     snap.portfolioEnd > snap.portfolioStart ?
                       <TrendingUpIcon sx={{ fontSize: 14 }} /> :
                       <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  </TimelineDot>
                  {i < sortedYears.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ pb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {age} 歲
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatPortfolio(snap.portfolioEnd)}
                    </Typography>
                    {isRetirement && <Chip label="退休" size="small" color="primary" sx={{ height: 20 }} />}
                    {isBankrupt && <Chip label="破產" size="small" color="error" sx={{ height: 20 }} />}
                    {isPeak && !isBankrupt && <Chip label="資產峰值" size="small" color="success" sx={{ height: 20 }} />}
                    {isLast && !isBankrupt && <Chip label="模擬結束" size="small" sx={{ height: 20 }} />}
                  </Stack>

                  {/* 年度摘要 */}
                  <Typography variant="caption" color="text.secondary">
                    報酬 {(snap.weightedReturn * 100).toFixed(1)}%
                    {snap.contribution > 0 && ` ・ 存入 ${formatPortfolio(snap.contribution)}`}
                    {snap.withdrawal > 0 && ` ・ 提領 ${formatPortfolio(snap.withdrawal)}`}
                    {snap.eventExpense > 0 && ` ・ 事件支出 ${formatPortfolio(snap.eventExpense)}`}
                  </Typography>

                  {/* 事件卡片 */}
                  {snap.events.map((evt, j) => (
                    <Paper key={j} variant="outlined" sx={{
                      mt: 1, p: 1.5,
                      borderLeft: `3px solid ${CATEGORY_COLORS[evt.event.category]}`,
                      bgcolor: evt.event.isPositive ? '#e8f5e910' : '#fff3e010',
                    }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <Typography variant="body2">
                          {CATEGORY_EMOJI[evt.event.category]}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {evt.event.name}
                        </Typography>
                        <Chip size="small" variant="outlined"
                          label={CATEGORY_LABELS[evt.event.category]}
                          sx={{
                            height: 18, fontSize: 10,
                            borderColor: CATEGORY_COLORS[evt.event.category],
                            color: CATEGORY_COLORS[evt.event.category],
                          }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {evt.event.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {evt.actualImpacts.map((impact, k) => (
                          <Chip key={k} size="small"
                            label={`${impact.description} (${formatMoney(impact.amount)})`}
                            color={impact.amount >= 0 ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ height: 22, fontSize: 11 }} />
                        ))}
                      </Stack>
                    </Paper>
                  ))}
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </Paper>
    </Box>
  )
}

/** 迷你資產走勢 Canvas */
function StoryChart({ snapshots, currentAge, retirementAge }: {
  snapshots: { age: number; portfolioEnd: number; events: { event: { isPositive?: boolean } }[] }[]
  currentAge: number
  retirementAge: number
}) {
  const theme = useTheme()

  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = 800, H = 250
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = '100%'
    canvas.style.maxWidth = W + 'px'
    canvas.style.height = 'auto'

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 16, right: 20, bottom: 36, left: 64 }
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom
    const years = snapshots.length
    const maxVal = Math.max(...snapshots.map(s => s.portfolioEnd)) * 1.1

    const x = (i: number) => pad.left + (i / (years - 1)) * plotW
    const y = (v: number) => pad.top + plotH - (Math.max(v, 0) / maxVal) * plotH

    // Grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 0.5
    for (let s = 1; s <= 4; s++) {
      const val = (maxVal / 4) * s
      ctx.beginPath()
      ctx.moveTo(pad.left, y(val))
      ctx.lineTo(W - pad.right, y(val))
      ctx.stroke()
    }

    // Line
    ctx.strokeStyle = theme.palette.primary.main
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (let i = 0; i < years; i++) {
      const val = snapshots[i].portfolioEnd
      if (i === 0) ctx.moveTo(x(i), y(val))
      else ctx.lineTo(x(i), y(val))
    }
    ctx.stroke()

    // Event markers
    for (let i = 0; i < years; i++) {
      if (snapshots[i].events.length > 0) {
        const hasPositive = snapshots[i].events.some(e => e.event.isPositive)
        ctx.fillStyle = hasPositive ? '#2e7d32' : '#e65100'
        ctx.beginPath()
        ctx.arc(x(i), y(snapshots[i].portfolioEnd), 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Retirement line
    const retireIdx = retirementAge - currentAge
    if (retireIdx > 0 && retireIdx < years) {
      ctx.strokeStyle = '#ff980088'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(x(retireIdx), pad.top)
      ctx.lineTo(x(retireIdx), pad.top + plotH)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Axes labels
    ctx.fillStyle = '#757575'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    const step = Math.max(1, Math.floor(years / 8))
    for (let i = 0; i < years; i += step) {
      ctx.fillText(`${currentAge + i}`, x(i), H - 8)
    }
    ctx.textAlign = 'right'
    for (let s = 0; s <= 4; s++) {
      const val = (maxVal / 4) * s
      const abs = Math.abs(val)
      const label = abs >= 1e6 ? `$${(val / 1e6).toFixed(1)}M` : `$${(val / 1e3).toFixed(0)}K`
      ctx.fillText(label, pad.left - 6, y(val) + 4)
    }
  }

  return <canvas ref={canvasRef} />
}
