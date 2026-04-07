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
import HomeIcon from '@mui/icons-material/Home'
import type { EventCategory } from '../events/eventTypes'
import type { ImmigrationPhase } from '../engine/immigrationTypes'
import { CATEGORY_LABELS } from '../events/eventDatabase'
import { CATEGORY_LABELS_TW } from '../events/eventDatabase_tw'
import { CATEGORY_LABELS_JP } from '../events/eventDatabase_jp'
import { useGameStore } from '../store/gameStore'
import { formatCurrency, formatCurrencySigned, type Region } from '../config/regions'
import { OCCUPATION_MAP } from '../engine/occupationData'

const CATEGORY_COLORS: Record<EventCategory, string> = {
  market: '#1565c0',
  career: '#6a1b9a',
  health: '#c62828',
  family: '#2e7d32',
  property: '#e65100',
  legal: '#37474f',
  immigration: '#00838f',
}

const CATEGORY_EMOJI: Record<EventCategory, string> = {
  market: '📉',
  career: '💼',
  health: '🏥',
  family: '👨‍👩‍👧',
  property: '🏠',
  legal: '⚖️',
  immigration: '✈️',
}

export function StoryPanel() {
  const storyResult = useGameStore(s => s.storyResult)
  const currentAge = useGameStore(s => s.currentAge)
  const retirementAge = useGameStore(s => s.retirementAge)
  const region = useGameStore(s => s.region)
  const occupationEnabled = useGameStore(s => s.occupationEnabled)
  const occupationId = useGameStore(s => s.occupationId)
  const categoryLabels = region === 'jp' ? CATEGORY_LABELS_JP : region === 'tw' ? CATEGORY_LABELS_TW : CATEGORY_LABELS
  const fmtP = (n: number) => formatCurrency(n, region)
  const fmtM = (n: number) => formatCurrencySigned(n, region)

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

  // 移民結果
  const hasImmigration = snapshots.some(s => s.immigrationPhase && s.immigrationPhase !== 'none')
  let immigrationOutcome: { success: boolean; phase: ImmigrationPhase; settledAge: number | null; prAge: number | null; returnedAge: number | null; targetRegion: string | null } | null = null
  if (hasImmigration) {
    const settledSnap = snapshots.find(s => s.immigrationPhase === 'transition')
    const prSnap = snapshots.find(s => s.immigrationPhase === 'permanent')
    const returnedSnap = snapshots.find(s => s.immigrationPhase === 'forced_return' || s.immigrationPhase === 'returned')
    const abandonedSnap = snapshots.find(s => s.immigrationPhase === 'abandoned')
    const lastPhase = snapshots[snapshots.length - 1].immigrationPhase ?? 'none'
    const targetRegion = settledSnap?.activeRegion ?? snapshots.find(s => s.activeRegion && s.activeRegion !== region)?.activeRegion ?? null

    const isSettled = ['transition', 'settled', 'permanent'].includes(lastPhase)
    immigrationOutcome = {
      success: isSettled || lastPhase === 'permanent',
      phase: lastPhase,
      settledAge: settledSnap?.age ?? null,
      prAge: prSnap?.age ?? null,
      returnedAge: returnedSnap?.age ?? null,
      targetRegion: targetRegion ?? null,
    }
    if (abandonedSnap && !isSettled) {
      immigrationOutcome.success = false
    }
  }

  const targetFlag = immigrationOutcome?.targetRegion === 'jp' ? '🇯🇵' : immigrationOutcome?.targetRegion === 'us' ? '🇺🇸' : ''
  const targetName = immigrationOutcome?.targetRegion === 'jp' ? '日本' : immigrationOutcome?.targetRegion === 'us' ? '美國' : ''

  // 購屋結果
  const housingPurchaseSnap = snapshots.find(s => s.housing?.ownsHouse)
  const hasHousing = !!housingPurchaseSnap
  const lastHousingSnap = snapshots[snapshots.length - 1].housing
  const housingPurchaseAge = housingPurchaseSnap?.age ?? null
  // 加入購屋年份到 keyYears 會在下面處理

  // 篩選有事件的年份 + 關鍵年份（退休、破產、第一年、最後一年、資產最高）
  const keyYears = new Set<number>()
  keyYears.add(0)
  keyYears.add(totalYears - 1)
  keyYears.add(retirementAge - currentAge)
  if (bankruptAge) keyYears.add(bankruptAge - currentAge)
  keyYears.add(peakAge - currentAge)
  if (housingPurchaseAge) keyYears.add(housingPurchaseAge - currentAge)
  snapshots.forEach((s, i) => { if (s.events.length > 0) keyYears.add(i) })

  // 每 5 年也加入
  for (let i = 0; i < totalYears; i += 5) keyYears.add(i)

  const sortedYears = [...keyYears].filter(y => y >= 0 && y < totalYears).sort((a, b) => a - b)

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
          最終資產 {fmtP(finalPortfolio)}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`${allEvents.length} 個事件`} variant="outlined" />
          <Chip label={`${positiveEvents.length} 正面`} color="success" variant="outlined" />
          <Chip label={`${negativeEvents.length} 負面`} color="error" variant="outlined" />
          <Chip label={`峰值 ${fmtP(peakPortfolio)} @ ${peakAge}歲`} variant="outlined" />
        </Stack>
      </Paper>

      {/* 移民結果 */}
      {immigrationOutcome && (
        <Paper elevation={2} sx={{
          p: 2.5, mb: 3, textAlign: 'center',
          background: immigrationOutcome.success
            ? 'linear-gradient(135deg, #00838f11, #00838f08)'
            : 'linear-gradient(135deg, #ff6f0011, #ff6f0008)',
          border: immigrationOutcome.success ? '1px solid #00838f33' : '1px solid #ff6f0033',
        }}>
          <Typography variant="h4" fontWeight={800}
            color={immigrationOutcome.success ? '#00838f' : '#e65100'}>
            {immigrationOutcome.success
              ? `${targetFlag} ${immigrationOutcome.settledAge} 歲成功移民${targetName}`
              : immigrationOutcome.phase === 'abandoned'
                ? `移民${targetName}失敗（簽證未通過）`
                : immigrationOutcome.returnedAge
                  ? `${immigrationOutcome.returnedAge} 歲被迫回國`
                  : `移民${targetName}未成功`}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            {immigrationOutcome.settledAge && (
              <Chip icon={<span>{targetFlag}</span>} label={`${immigrationOutcome.settledAge} 歲抵達${targetName}`}
                color="info" variant="outlined" />
            )}
            {immigrationOutcome.prAge && (
              <Chip label={`${immigrationOutcome.prAge} 歲取得永住權 🎉`} color="success" variant="outlined" />
            )}
            {immigrationOutcome.returnedAge && (
              <Chip label={`${immigrationOutcome.returnedAge} 歲回國`} color="warning" variant="outlined" />
            )}
            {immigrationOutcome.phase === 'abandoned' && (
              <Chip label="簽證多次被拒，放棄移民" color="error" variant="outlined" />
            )}
          </Stack>
        </Paper>
      )}

      {/* 購屋結果 */}
      {hasHousing && lastHousingSnap && (
        <Paper elevation={2} sx={{
          p: 2.5, mb: 3, textAlign: 'center',
          background: 'linear-gradient(135deg, #e6510011, #e6510008)',
          border: '1px solid #e6510033',
        }}>
          <Typography variant="h4" fontWeight={800} color="#e65100">
            {housingPurchaseAge} 歲購屋
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            <Chip icon={<HomeIcon />} label={`房屋市值 ${fmtP(lastHousingSnap.houseValue)}`}
              color="warning" variant="outlined" />
            <Chip label={`淨值 ${fmtP(lastHousingSnap.equity)}`}
              color="success" variant="outlined" />
            {lastHousingSnap.mortgageBalance > 0 && (
              <Chip label={`房貸餘額 ${fmtP(lastHousingSnap.mortgageBalance)}`}
                color="error" variant="outlined" />
            )}
            {lastHousingSnap.mortgageBalance === 0 && (
              <Chip label="房貸已繳清" color="success" variant="outlined" />
            )}
          </Stack>
        </Paper>
      )}

      {/* 職業摘要 */}
      {occupationEnabled && (() => {
        const occ = OCCUPATION_MAP.get(occupationId)
        if (!occ) return null
        const workYears = Math.max(0, retirementAge - currentAge)
        const lastWorkSnap = snapshots.find(s => s.age === retirementAge - 1)
        const salarySnaps = snapshots.filter(s => s.currentSalary != null).map(s => s.currentSalary!)
        const peakSalary = salarySnaps.length > 0 ? Math.max(...salarySnaps) : 0
        return (
          <Paper elevation={2} sx={{
            p: 2.5, mb: 3, textAlign: 'center',
            background: 'linear-gradient(135deg, #1565c011, #1565c008)',
            border: '1px solid #1565c033',
          }}>
            <Typography variant="h5" fontWeight={800} color="#1565c0">
              {occ.emoji} {occ.name[region]}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              起薪 {fmtP(occ.baseSalary[region])} → 退休前 {lastWorkSnap?.currentSalary ? fmtP(lastWorkSnap.currentSalary) : '—'}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
              <Chip label={`工作 ${workYears} 年`} variant="outlined" />
              <Chip label={`薪資巔峰 ${fmtP(peakSalary)}`} color="primary" variant="outlined" />
            </Stack>
          </Paper>
        )
      })()}

      {/* 資產走勢迷你圖 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          資產走勢
        </Typography>
        <StoryChart snapshots={snapshots} currentAge={currentAge} retirementAge={retirementAge} region={region} />
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

            const hasImmigrationEvent = snap.events.some(e => e.event.category === 'immigration')
            const isHousingPurchase = snap.housing?.ownsHouse && (!snapshots[yearIdx - 1]?.housing?.ownsHouse)

            let dotColor: 'success' | 'error' | 'primary' | 'warning' | 'info' | 'grey' = 'grey'
            if (isBankrupt) dotColor = 'error'
            else if (isRetirement) dotColor = 'primary'
            else if (isHousingPurchase) dotColor = 'warning'
            else if (hasImmigrationEvent) dotColor = 'info'
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
                      {snap.activeRegion && snap.activeRegion !== region
                        ? `${snap.activeRegion === 'jp' ? '🇯🇵' : snap.activeRegion === 'us' ? '🇺🇸' : '🇹🇼'} `
                        : ''}{age} 歲
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fmtP(snap.portfolioEnd)}
                    </Typography>
                    {isRetirement && <Chip label="退休" size="small" color="primary" sx={{ height: 20 }} />}
                    {isBankrupt && <Chip label="破產" size="small" color="error" sx={{ height: 20 }} />}
                    {isPeak && !isBankrupt && <Chip label="資產峰值" size="small" color="success" sx={{ height: 20 }} />}
                    {isLast && !isBankrupt && <Chip label="模擬結束" size="small" sx={{ height: 20 }} />}
                  </Stack>

                  {/* 年度摘要 */}
                  <Typography variant="caption" color="text.secondary">
                    報酬 {(snap.weightedReturn * 100).toFixed(1)}%
                    {snap.contribution > 0 && ` ・ 存入 ${fmtP(snap.contribution)}`}
                    {snap.withdrawal > 0 && ` ・ 提領 ${fmtP(snap.withdrawal)}`}
                    {snap.eventExpense > 0 && ` ・ 事件支出 ${fmtP(snap.eventExpense)}`}
                  </Typography>
                  {/* 職業薪資 */}
                  {snap.currentSalary != null && snap.raiseRate != null && !isRetirement && age < retirementAge && (
                    <Typography variant="caption" color="#1565c0">
                      💰 年薪 {fmtP(snap.currentSalary)}
                      {snap.raiseRate > 0 && `（+${(snap.raiseRate * 100).toFixed(1)}%）`}
                    </Typography>
                  )}

                  {/* 購屋事件 */}
                  {isHousingPurchase && snap.housing && (
                    <Paper variant="outlined" sx={{
                      mt: 1, p: 1.5,
                      borderLeft: '3px solid #e65100',
                      bgcolor: '#fff3e010',
                    }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <HomeIcon sx={{ fontSize: 16, color: '#e65100' }} />
                        <Typography variant="body2" fontWeight={700}>購入自住房</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        房價 {fmtP(snap.housing.houseValue)} ・ 房貸 {fmtP(snap.housing.mortgageBalance)}
                      </Typography>
                    </Paper>
                  )}

                  {/* 房屋資訊（非購屋年顯示簡要） */}
                  {snap.housing?.ownsHouse && !isHousingPurchase && (
                    <Typography variant="caption" color="#e65100">
                      房屋 {fmtP(snap.housing.houseValue)}
                      {snap.housing.mortgageBalance > 0
                        ? ` ・ 房貸餘額 ${fmtP(snap.housing.mortgageBalance)}`
                        : ' ・ 房貸已清'}
                      {` ・ 年住房支出 ${fmtP(snap.housing.annualHousingCost)}`}
                    </Typography>
                  )}

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
                          {evt.displayName ?? evt.event.name}
                        </Typography>
                        <Chip size="small" variant="outlined"
                          label={categoryLabels[evt.event.category]}
                          sx={{
                            height: 18, fontSize: 10,
                            borderColor: CATEGORY_COLORS[evt.event.category],
                            color: CATEGORY_COLORS[evt.event.category],
                          }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {evt.displayDescription ?? evt.event.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {evt.actualImpacts.map((impact, k) => (
                          <Chip key={k} size="small"
                            label={`${impact.description} (${fmtM(impact.amount)})`}
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
function StoryChart({ snapshots, currentAge, retirementAge, region }: {
  snapshots: { age: number; portfolioEnd: number; events: { event: { isPositive?: boolean } }[] }[]
  currentAge: number
  retirementAge: number
  region: Region
}) {
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'
  const gridColor = isDark ? '#444' : '#e0e0e0'
  const labelColor = isDark ? '#aaa' : '#757575'

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
    ctx.strokeStyle = gridColor
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
    ctx.fillStyle = labelColor
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    const step = Math.max(1, Math.floor(years / 8))
    for (let i = 0; i < years; i += step) {
      ctx.fillText(`${currentAge + i}`, x(i), H - 8)
    }
    ctx.textAlign = 'right'
    for (let s = 0; s <= 4; s++) {
      const val = (maxVal / 4) * s
      ctx.fillText(formatCurrency(val, region), pad.left - 6, y(val) + 4)
    }
  }

  return <canvas ref={canvasRef} />
}
