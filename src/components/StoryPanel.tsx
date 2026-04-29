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
import { useI18n } from '../i18n'
import type { UiLanguage } from '../i18n/types'
import { useGameStore } from '../store/gameStore'
import { formatCurrency, formatCurrencySigned, getRegionLabel, type Region } from '../config/regions'
import { OCCUPATION_MAP } from '../engine/occupationData'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

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

const REGION_EMOJI: Partial<Record<Region, string>> = {
  us: '🇺🇸',
  tw: '🇹🇼',
  jp: '🇯🇵',
  'ph-manila': '🇵🇭',
  'ph-cebu': '🇵🇭',
}

function getCategoryLabels(t: TranslateFn): Record<EventCategory, string> {
  return {
    market: t('story.category.market'),
    career: t('story.category.career'),
    health: t('story.category.health'),
    family: t('story.category.family'),
    property: t('story.category.property'),
    legal: t('story.category.legal'),
    immigration: t('story.category.immigration'),
  }
}

export function StoryPanel() {
  const storyResult = useGameStore((s) => s.storyResult)
  const currentAge = useGameStore((s) => s.currentAge)
  const retirementAge = useGameStore((s) => s.retirementAge)
  const region = useGameStore((s) => s.region)
  const occupationEnabled = useGameStore((s) => s.occupationEnabled)
  const occupationId = useGameStore((s) => s.occupationId)
  const { language, t } = useI18n()
  const categoryLabels = getCategoryLabels(t)
  const fmtP = (n: number) => formatCurrency(n, region, language)
  const fmtM = (n: number) => formatCurrencySigned(n, region, language)

  if (!storyResult) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '80vh', color: 'text.disabled',
      }}>
        <AutoStoriesIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
        <Typography variant="h5">{t('story.empty_title')}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t('story.empty_body')}
        </Typography>
      </Box>
    )
  }

  const { snapshots, bankrupt, bankruptAge, finalPortfolio, allEvents } = storyResult
  const totalYears = snapshots.length
  const positiveEvents = allEvents.filter((e) => e.event.isPositive)
  const negativeEvents = allEvents.filter((e) => !e.event.isPositive)
  const peakPortfolio = Math.max(...snapshots.map((s) => s.portfolioEnd))
  const peakAge = snapshots.find((s) => s.portfolioEnd === peakPortfolio)?.age ?? 0

  const hasImmigration = snapshots.some((s) => s.immigrationPhase && s.immigrationPhase !== 'none')
  let immigrationOutcome: {
    success: boolean
    phase: ImmigrationPhase
    settledAge: number | null
    prAge: number | null
    returnedAge: number | null
    targetRegion: Region | null
  } | null = null

  if (hasImmigration) {
    const settledSnap = snapshots.find((s) => s.immigrationPhase === 'transition')
    const prSnap = snapshots.find((s) => s.immigrationPhase === 'permanent')
    const returnedSnap = snapshots.find((s) => s.immigrationPhase === 'forced_return' || s.immigrationPhase === 'returned')
    const abandonedSnap = snapshots.find((s) => s.immigrationPhase === 'abandoned')
    const lastPhase = snapshots[snapshots.length - 1].immigrationPhase ?? 'none'
    const targetRegion = (settledSnap?.activeRegion ?? snapshots.find((s) => s.activeRegion && s.activeRegion !== region)?.activeRegion ?? null) as Region | null
    const isSettled = ['transition', 'settled', 'permanent'].includes(lastPhase)

    immigrationOutcome = {
      success: isSettled || lastPhase === 'permanent',
      phase: lastPhase,
      settledAge: settledSnap?.age ?? null,
      prAge: prSnap?.age ?? null,
      returnedAge: returnedSnap?.age ?? null,
      targetRegion,
    }

    if (abandonedSnap && !isSettled) {
      immigrationOutcome.success = false
    }
  }

  const targetFlag = immigrationOutcome?.targetRegion ? (REGION_EMOJI[immigrationOutcome.targetRegion] ?? '') : ''
  const targetName = immigrationOutcome?.targetRegion ? getRegionLabel(immigrationOutcome.targetRegion, language) : ''

  const housingPurchaseSnap = snapshots.find((s) => s.housing?.ownsHouse)
  const hasHousing = !!housingPurchaseSnap
  const lastHousingSnap = snapshots[snapshots.length - 1].housing
  const housingPurchaseAge = housingPurchaseSnap?.age ?? null

  const keyYears = new Set<number>()
  keyYears.add(0)
  keyYears.add(totalYears - 1)
  keyYears.add(retirementAge - currentAge)
  if (bankruptAge) keyYears.add(bankruptAge - currentAge)
  keyYears.add(peakAge - currentAge)
  if (housingPurchaseAge) keyYears.add(housingPurchaseAge - currentAge)
  snapshots.forEach((s, i) => { if (s.events.length > 0) keyYears.add(i) })
  for (let i = 0; i < totalYears; i += 5) keyYears.add(i)
  const sortedYears = [...keyYears].filter((y) => y >= 0 && y < totalYears).sort((a, b) => a - b)

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper elevation={2} sx={{
        p: 3, mb: 3, textAlign: 'center',
        background: bankrupt
          ? 'linear-gradient(135deg, #d32f2f11, #d32f2f08)'
          : 'linear-gradient(135deg, #2e7d3211, #2e7d3208)',
        border: bankrupt ? '1px solid #d32f2f33' : '1px solid #2e7d3233',
      }}>
        <Typography variant="h3" fontWeight={800} color={bankrupt ? 'error.main' : 'success.main'}>
          {bankrupt ? t('story.bankrupt', { age: bankruptAge ?? 0 }) : t('story.survived')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          {t('story.final_portfolio', { value: fmtP(finalPortfolio) })}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={t('story.event_count', { count: allEvents.length })} variant="outlined" />
          <Chip label={t('story.positive_count', { count: positiveEvents.length })} color="success" variant="outlined" />
          <Chip label={t('story.negative_count', { count: negativeEvents.length })} color="error" variant="outlined" />
          <Chip label={t('story.peak', { value: fmtP(peakPortfolio), age: peakAge })} variant="outlined" />
        </Stack>
      </Paper>

      {immigrationOutcome && (
        <Paper elevation={2} sx={{
          p: 2.5, mb: 3, textAlign: 'center',
          background: immigrationOutcome.success
            ? 'linear-gradient(135deg, #00838f11, #00838f08)'
            : 'linear-gradient(135deg, #ff6f0011, #ff6f0008)',
          border: immigrationOutcome.success ? '1px solid #00838f33' : '1px solid #ff6f0033',
        }}>
          <Typography variant="h4" fontWeight={800} color={immigrationOutcome.success ? '#00838f' : '#e65100'}>
            {immigrationOutcome.success
              ? t('story.immigration_success', { flag: targetFlag, age: immigrationOutcome.settledAge ?? 0, target: targetName })
              : immigrationOutcome.phase === 'abandoned'
                ? t('story.immigration_abandoned', { target: targetName })
                : immigrationOutcome.returnedAge
                  ? t('story.immigration_returned', { age: immigrationOutcome.returnedAge })
                  : t('story.immigration_failed', { target: targetName })}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            {immigrationOutcome.settledAge && (
              <Chip icon={<span>{targetFlag}</span>} label={t('story.immigration_arrived', { age: immigrationOutcome.settledAge, target: targetName })} color="info" variant="outlined" />
            )}
            {immigrationOutcome.prAge && (
              <Chip label={t('story.immigration_pr', { age: immigrationOutcome.prAge })} color="success" variant="outlined" />
            )}
            {immigrationOutcome.returnedAge && (
              <Chip label={t('story.immigration_returned_chip', { age: immigrationOutcome.returnedAge })} color="warning" variant="outlined" />
            )}
            {immigrationOutcome.phase === 'abandoned' && (
              <Chip label={t('story.immigration_abandoned_chip')} color="error" variant="outlined" />
            )}
          </Stack>
        </Paper>
      )}

      {hasHousing && lastHousingSnap && (
        <Paper elevation={2} sx={{
          p: 2.5, mb: 3, textAlign: 'center',
          background: 'linear-gradient(135deg, #e6510011, #e6510008)',
          border: '1px solid #e6510033',
        }}>
          <Typography variant="h4" fontWeight={800} color="#e65100">
            {t('story.housing_bought', { age: housingPurchaseAge ?? 0 })}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            <Chip icon={<HomeIcon />} label={t('story.housing_value', { value: fmtP(lastHousingSnap.houseValue) })} color="warning" variant="outlined" />
            <Chip label={t('story.housing_equity', { value: fmtP(lastHousingSnap.equity) })} color="success" variant="outlined" />
            {lastHousingSnap.mortgageBalance > 0 && (
              <Chip label={t('story.housing_mortgage', { value: fmtP(lastHousingSnap.mortgageBalance) })} color="error" variant="outlined" />
            )}
            {lastHousingSnap.mortgageBalance === 0 && (
              <Chip label={t('story.housing_paid_off')} color="success" variant="outlined" />
            )}
          </Stack>
        </Paper>
      )}

      {occupationEnabled && (() => {
        const occ = OCCUPATION_MAP.get(occupationId)
        if (!occ) return null
        const workYears = Math.max(0, retirementAge - currentAge)
        const lastWorkSnap = snapshots.find((s) => s.age === retirementAge - 1)
        const salarySnaps = snapshots.filter((s) => s.currentSalary != null).map((s) => s.currentSalary!)
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
              {t('story.occupation_start_to_end', {
                start: fmtP(occ.baseSalary[region]),
                end: lastWorkSnap?.currentSalary ? fmtP(lastWorkSnap.currentSalary) : '—',
              })}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
              <Chip label={t('story.occupation_years', { years: workYears })} variant="outlined" />
              <Chip label={t('story.occupation_peak', { value: fmtP(peakSalary) })} color="primary" variant="outlined" />
            </Stack>
          </Paper>
        )
      })()}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          {t('story.chart_title')}
        </Typography>
        <StoryChart snapshots={snapshots} currentAge={currentAge} retirementAge={retirementAge} region={region} language={language} />
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          {t('story.timeline_title')}
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

            const hasImmigrationEvent = snap.events.some((e) => e.event.category === 'immigration')
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
                      snap.portfolioEnd > snap.portfolioStart
                        ? <TrendingUpIcon sx={{ fontSize: 14 }} />
                        : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  </TimelineDot>
                  {i < sortedYears.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ pb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {snap.activeRegion && snap.activeRegion !== region
                        ? `${REGION_EMOJI[snap.activeRegion as Region] ?? ''} `
                        : ''}{age}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fmtP(snap.portfolioEnd)}
                    </Typography>
                    {isRetirement && <Chip label={t('story.retirement')} size="small" color="primary" sx={{ height: 20 }} />}
                    {isBankrupt && <Chip label={t('story.bankrupt_chip')} size="small" color="error" sx={{ height: 20 }} />}
                    {isPeak && !isBankrupt && <Chip label={t('story.peak_chip')} size="small" color="success" sx={{ height: 20 }} />}
                    {isLast && !isBankrupt && <Chip label={t('story.end_chip')} size="small" sx={{ height: 20 }} />}
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    {t('story.year_summary_return', { value: `${(snap.weightedReturn * 100).toFixed(1)}%` })}
                    {snap.contribution > 0 && ` · ${t('story.year_summary_contribution', { value: fmtP(snap.contribution) })}`}
                    {snap.withdrawal > 0 && ` · ${t('story.year_summary_withdrawal', { value: fmtP(snap.withdrawal) })}`}
                    {snap.eventExpense > 0 && ` · ${t('story.year_summary_event_expense', { value: fmtP(snap.eventExpense) })}`}
                  </Typography>

                  {snap.currentSalary != null && snap.raiseRate != null && !isRetirement && age < retirementAge && (
                    <Typography variant="caption" color="#1565c0">
                      {t('story.salary', { value: fmtP(snap.currentSalary) })}
                      {snap.raiseRate > 0 && ` ${t('story.raise', { value: `${(snap.raiseRate * 100).toFixed(1)}%` })}`}
                    </Typography>
                  )}

                  {isHousingPurchase && snap.housing && (
                    <Paper variant="outlined" sx={{
                      mt: 1, p: 1.5,
                      borderLeft: '3px solid #e65100',
                      bgcolor: '#fff3e010',
                    }}>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <HomeIcon sx={{ fontSize: 16, color: '#e65100' }} />
                        <Typography variant="body2" fontWeight={700}>{t('story.home_purchase_card')}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {t('story.home_purchase_detail', { value: fmtP(snap.housing.houseValue), mortgage: fmtP(snap.housing.mortgageBalance) })}
                      </Typography>
                    </Paper>
                  )}

                  {snap.housing?.ownsHouse && !isHousingPurchase && (
                    <Typography variant="caption" color="#e65100">
                      {t('story.home_status', { value: fmtP(snap.housing.houseValue) })}
                      {snap.housing.mortgageBalance > 0
                        ? ` · ${t('story.home_mortgage_balance', { value: fmtP(snap.housing.mortgageBalance) })}`
                        : ` · ${t('story.home_mortgage_paid')}`}
                      {` · ${t('story.home_annual_cost', { value: fmtP(snap.housing.annualHousingCost) })}`}
                    </Typography>
                  )}

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
                        <Chip
                          size="small"
                          variant="outlined"
                          label={categoryLabels[evt.event.category]}
                          sx={{
                            height: 18, fontSize: 10,
                            borderColor: CATEGORY_COLORS[evt.event.category],
                            color: CATEGORY_COLORS[evt.event.category],
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {evt.displayDescription ?? evt.event.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {evt.actualImpacts.map((impact, k) => (
                          <Chip
                            key={k}
                            size="small"
                            label={`${impact.description} (${fmtM(impact.amount)})`}
                            color={impact.amount >= 0 ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ height: 22, fontSize: 11 }}
                          />
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

function StoryChart({ snapshots, currentAge, retirementAge, region, language }: {
  snapshots: { age: number; portfolioEnd: number; events: { event: { isPositive?: boolean } }[] }[]
  currentAge: number
  retirementAge: number
  region: Region
  language: UiLanguage
}) {
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'
  const gridColor = isDark ? '#444' : '#e0e0e0'
  const labelColor = isDark ? '#aaa' : '#757575'

  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = 800
    const H = 250
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = '100%'
    canvas.style.maxWidth = `${W}px`
    canvas.style.height = 'auto'

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 16, right: 20, bottom: 36, left: 64 }
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom
    const years = snapshots.length
    const maxVal = Math.max(...snapshots.map((s) => s.portfolioEnd)) * 1.1

    const x = (i: number) => pad.left + (i / (years - 1)) * plotW
    const y = (v: number) => pad.top + plotH - (Math.max(v, 0) / maxVal) * plotH

    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    for (let s = 1; s <= 4; s++) {
      const val = (maxVal / 4) * s
      ctx.beginPath()
      ctx.moveTo(pad.left, y(val))
      ctx.lineTo(W - pad.right, y(val))
      ctx.stroke()
    }

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

    for (let i = 0; i < years; i++) {
      if (snapshots[i].events.length > 0) {
        const hasPositive = snapshots[i].events.some((e) => e.event.isPositive)
        ctx.fillStyle = hasPositive ? '#2e7d32' : '#e65100'
        ctx.beginPath()
        ctx.arc(x(i), y(snapshots[i].portfolioEnd), 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

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
      ctx.fillText(formatCurrency(val, region, language), pad.left - 6, y(val) + 4)
    }
  }

  return <canvas ref={canvasRef} />
}
