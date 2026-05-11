import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, useTheme, Tooltip, IconButton,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import WarningIcon from '@mui/icons-material/Warning'
import SavingsIcon from '@mui/icons-material/Savings'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useI18n } from '../i18n'
import { getLifestyleDisplay } from '../i18n/lifestyles'
import type { UiLanguage } from '../i18n/types'
import { useGameStore } from '../store/gameStore'
import { LIFESTYLE_PRESETS } from '../engine/lifestyle'
import { LIFESTYLE_PRESETS_TW } from '../engine/lifestyle_tw'
import { LIFESTYLE_PRESETS_JP } from '../engine/lifestyle_jp'
import { getPhilippinesLifestylePresets } from '../engine/lifestyle_ph'
import { formatCurrency, formatSliderValue, isPhilippinesRegion, type Region } from '../config/regions'
import { GuidePanel } from './GuidePanel'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

export function ResultPanel() {
  const result = useGameStore((s) => s.result)
  const currentAge = useGameStore((s) => s.currentAge)
  const retirementAge = useGameStore((s) => s.retirementAge)
  const lifestyleId = useGameStore((s) => s.lifestyleId)
  const annualIncome = useGameStore((s) => s.annualIncome)
  const annualExpense = useGameStore((s) => s.annualExpense)
  const annualContribution = useGameStore((s) => s.annualContribution)
  const region = useGameStore((s) => s.region)
  const { language, locale, t } = useI18n()

  const presets = isPhilippinesRegion(region)
    ? getPhilippinesLifestylePresets(region)
    : region === 'jp'
      ? LIFESTYLE_PRESETS_JP
      : region === 'tw'
        ? LIFESTYLE_PRESETS_TW
        : LIFESTYLE_PRESETS

  const fmt = (v: number) => formatCurrency(v, region, language)
  const fmtSlider = (v: number) => formatSliderValue(v, region, language)

  if (!result) {
    return <GuidePanel mode="simulation" />
  }

  const rate = result.successRate
  const rateColor = rate >= 0.8 ? 'success' : rate >= 0.5 ? 'warning' : 'error'
  const rateHex = rate >= 0.8 ? '#2a6d3a' : rate >= 0.5 ? '#9b5f15' : '#a92f28'
  const lifestylePreset = lifestyleId !== 'custom'
    ? presets[lifestyleId as keyof typeof presets]
    : null
  const lifestyleDisplay = lifestyleId !== 'custom'
    ? getLifestyleDisplay(region, lifestyleId as Exclude<typeof lifestyleId, 'custom'>, language)
    : null

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.25, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1.5 }}>
          <SavingsIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 0, lineHeight: 1.35 }}>
            {t('result.summary_title')}
            {lifestyleDisplay ? ` — ${lifestyleDisplay.emoji} ${lifestyleDisplay.name}` : ''}
          </Typography>
        </Stack>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.annual_income')}</Typography>
            <Typography variant="body1" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{fmtSlider(annualIncome)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.annual_expense')}</Typography>
            <Typography variant="body1" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{fmtSlider(annualExpense)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.annual_contribution')}</Typography>
            <Typography variant="body1" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{fmtSlider(annualContribution)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.savings_rate')}</Typography>
            <Typography
              variant="body1"
              fontWeight={700}
              color={annualIncome > 0 && annualContribution / annualIncome >= 0.3 ? 'success.main' : 'text.primary'}
            >
              {annualIncome > 0 ? `${(annualContribution / annualIncome * 100).toFixed(0)}%` : '—'}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, lineHeight: 1.55 }}>
          {t('result.summary_line', {
            monthlyExpense: fmtSlider(Math.round(annualExpense / 12)),
            retirementAge,
            workYears: retirementAge - currentAge,
          })}
          {lifestyleDisplay ? ` ・ ${lifestyleDisplay.description}` : ''}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{
        p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 1.5, sm: 3 }, textAlign: 'center',
        background: `linear-gradient(135deg, ${rateHex}11, ${rateHex}08)`,
        border: `1px solid ${rateHex}33`,
      }}>
        <Typography sx={{
          fontWeight: 800, color: rateHex, lineHeight: 1,
          fontSize: { xs: 'clamp(2.75rem, 16vw, 4.25rem)', md: '6rem' },
        }}>
          {(rate * 100).toFixed(1)}%
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Chip icon={<TrendingUpIcon />} label={t('result.hero_label')} color={rateColor} variant="outlined" />
          <HelpButton title={t('guide.term.survival_rate.body')} />
          <Chip label={t('result.paths', { count: result.numPaths.toLocaleString(locale) })} variant="outlined" size="small" />
        </Stack>
      </Paper>

      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard icon={<AccountBalanceIcon />} label={t('result.median_final_portfolio')}
            value={fmt(result.medianFinalPortfolio)} color="#0a0a0a" />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            icon={<WarningIcon />}
            label={t('result.median_depletion_age')}
            value={result.medianDepletionAge ? t('result.age_suffix', { age: result.medianDepletionAge.toFixed(0) }) : t('result.not_depleted')}
            color={result.medianDepletionAge ? '#a92f28' : '#2a6d3a'}
            help={t('guide.term.depletion_age.body')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard icon={<TrendingUpIcon />} label={t('result.p90_final_portfolio')}
            value={fmt(result.percentiles.p90[result.percentiles.p90.length - 1])} color="#0a0a0a" help={t('guide.term.percentile.body')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard icon={<TrendingUpIcon />} label={t('result.p10_final_portfolio')}
            value={fmt(result.percentiles.p10[result.percentiles.p10.length - 1])} color="#c8392f" help={t('guide.term.percentile.body')} />
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: { xs: 1.25, sm: 2 }, mb: { xs: 1.5, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('result.drawdown_title')}
          </Typography>
          <HelpButton title={t('guide.term.drawdown.body')} />
        </Stack>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_median')}
              value={`-${(result.maxDrawdown.median * 100).toFixed(1)}%`} color={result.maxDrawdown.median > 0.3 ? '#a92f28' : '#c8392f'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_p75')}
              value={`-${(result.maxDrawdown.p75 * 100).toFixed(1)}%`} color={result.maxDrawdown.p75 > 0.4 ? '#a92f28' : '#c8392f'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_p90')}
              value={`-${(result.maxDrawdown.p90 * 100).toFixed(1)}%`} color="#a92f28" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_worst')}
            value={`-${(result.maxDrawdown.worst * 100).toFixed(1)}%`} color="#7f231e" />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ p: { xs: 1.25, sm: 2 }, mb: { xs: 1.5, sm: 3 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.35 }}>
            {t('result.chart_title')}
          </Typography>
          <HelpButton title={t('guide.term.percentile.body')} />
        </Stack>
        <PercentileChart
          percentiles={result.percentiles}
          currentAge={currentAge}
          retirementAge={retirementAge}
          region={region}
          language={language}
          t={t}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 1.5, justifyContent: 'center' }} flexWrap="wrap" useFlexGap>
          <Legend color="rgba(10,10,10,0.10)" label={t('result.legend_p10_p90')} />
          <Legend color="rgba(200,57,47,0.22)" label={t('result.legend_p25_p75')} />
          <Legend color="#0a0a0a" label={t('result.legend_p50')} line />
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: { xs: 0.75, sm: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          {t('result.table_title')}
        </Typography>
        <TableContainer sx={{ maxHeight: { xs: 420, sm: 'none' }, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: { xs: 520, sm: 0 }, '& .MuiTableCell-root': { px: { xs: 0.75, sm: 2 }, whiteSpace: 'nowrap', fontSize: { xs: 12, sm: 14 } } }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('result.age')}</TableCell>
                <TableCell align="right" sx={{ color: '#a92f28' }}>P10</TableCell>
                <TableCell align="right" sx={{ color: '#c8392f' }}>P25</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>P50</TableCell>
                <TableCell align="right" sx={{ color: '#2a6d3a' }}>P75</TableCell>
                <TableCell align="right" sx={{ color: '#0a0a0a' }}>P90</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getTableRows(result.percentiles.p50.length).map((i) => (
                <TableRow key={i} hover
                  sx={currentAge + i === retirementAge ? {
                    bgcolor: 'action.hover', borderLeft: '3px solid', borderColor: 'primary.main',
                  } : undefined}>
                  <TableCell>
                    {currentAge + i}
                    {currentAge + i === retirementAge && (
                      <Chip label={t('result.retirement')} size="small" color="primary" sx={{ ml: 0.5, height: 20, fontSize: 11 }} />
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#a92f28' }}>
                    {fmt(result.percentiles.p10[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#c8392f' }}>
                    {fmt(result.percentiles.p25[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {fmt(result.percentiles.p50[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#2a6d3a' }}>
                    {fmt(result.percentiles.p75[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#0a0a0a' }}>
                    {fmt(result.percentiles.p90[i])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

function StatCard({ icon, label, value, color, help }: {
  icon: ReactNode
  label: string
  value: string
  color: string
  help?: string
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.1, sm: 2 },
        minHeight: { xs: 118, sm: 132 },
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ color, mb: 0.5, '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 24 } } }}>{icon}</Box>
      <Stack direction="row" alignItems="flex-start" justifyContent="center" spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.25, overflowWrap: 'anywhere' }}
        >
          {label}
        </Typography>
        {help && <HelpButton title={help} />}
      </Stack>
      <Typography
        fontWeight={800}
        sx={{
          mt: 0.5,
          lineHeight: 1.15,
          fontSize: { xs: 'clamp(0.95rem, 4.2vw, 1.2rem)', sm: '1.5rem' },
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </Typography>
    </Paper>
  )
}

function HelpButton({ title }: { title: string }) {
  return (
    <Tooltip title={<Box sx={{ maxWidth: 280, lineHeight: 1.5 }}>{title}</Box>} arrow enterTouchDelay={0}>
      <IconButton size="small" aria-label="Help" sx={{ p: 0.25 }}>
        <HelpOutlineIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  )
}

function Legend({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {line ? (
        <Box sx={{ width: 20, height: 3, bgcolor: color, borderRadius: 1 }} />
      ) : (
        <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: 0.5 }} />
      )}
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Stack>
  )
}

function getTableRows(totalYears: number): number[] {
  const rows: number[] = []
  for (let i = 0; i < totalYears; i += 5) rows.push(i)
  if (rows[rows.length - 1] !== totalYears - 1) rows.push(totalYears - 1)
  return rows
}

function PercentileChart({ percentiles, currentAge, retirementAge, region, language, t }: {
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] }
  currentAge: number
  retirementAge: number
  region: Region
  language: UiLanguage
  t: TranslateFn
}) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [chartWidth, setChartWidth] = useState(800)
  const primary = theme.palette.primary.main

  const isDark = theme.palette.mode === 'dark'
  const gridColor = isDark ? '#444' : '#e0e0e0'
  const axisColor = isDark ? '#666' : '#bdbdbd'
  const labelColor = isDark ? '#aaa' : '#757575'

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateWidth = () => {
      setChartWidth(Math.max(320, Math.min(800, Math.floor(element.clientWidth))))
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W = chartWidth
    const H = Math.max(260, Math.round(W * 0.48))
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = '100%'
    canvas.style.height = `${H}px`

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const compact = W < 520
    const pad = {
      top: compact ? 24 : 20,
      right: compact ? 12 : 24,
      bottom: compact ? 38 : 44,
      left: compact ? 54 : 72,
    }
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom

    const years = percentiles.p50.length
    const maxVal = Math.max(1, Math.max(...percentiles.p90) * 1.08)

    const x = (i: number) => pad.left + (i / (years - 1)) * plotW
    const y = (v: number) => pad.top + plotH - (Math.max(v, 0) / maxVal) * plotH

    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    for (let s = 1; s <= 5; s++) {
      const val = (maxVal / 5) * s
      ctx.beginPath()
      ctx.moveTo(pad.left, y(val))
      ctx.lineTo(W - pad.right, y(val))
      ctx.stroke()
    }

    ctx.fillStyle = `${primary}1F`
    ctx.beginPath()
    for (let i = 0; i < years; i++) ctx.lineTo(x(i), y(percentiles.p90[i]))
    for (let i = years - 1; i >= 0; i--) ctx.lineTo(x(i), y(percentiles.p10[i]))
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = `${primary}47`
    ctx.beginPath()
    for (let i = 0; i < years; i++) ctx.lineTo(x(i), y(percentiles.p75[i]))
    for (let i = years - 1; i >= 0; i--) ctx.lineTo(x(i), y(percentiles.p25[i]))
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = primary
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (let i = 0; i < years; i++) {
      if (i === 0) ctx.moveTo(x(i), y(percentiles.p50[i]))
      else ctx.lineTo(x(i), y(percentiles.p50[i]))
    }
    ctx.stroke()

    const retireYear = retirementAge - currentAge
    if (retireYear > 0 && retireYear < years) {
      ctx.strokeStyle = '#c8392f88'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(x(retireYear), pad.top)
      ctx.lineTo(x(retireYear), pad.top + plotH)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#c8392f'
      ctx.font = `${compact ? 10 : 12}px "JetBrains Mono", "Noto Sans TC", monospace`
      ctx.textAlign = 'center'
      ctx.fillText(t('result.retirement'), x(retireYear), pad.top - 6)
    }

    ctx.strokeStyle = '#ef535088'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(pad.left, y(0))
    ctx.lineTo(W - pad.right, y(0))
    ctx.stroke()
    ctx.setLineDash([])

    ctx.strokeStyle = axisColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(W - pad.right, pad.top + plotH)
    ctx.stroke()

    ctx.fillStyle = labelColor
    ctx.font = `${compact ? 10 : 12}px "Noto Sans TC", sans-serif`
    ctx.textAlign = 'center'
    const xStep = Math.max(1, Math.floor(years / (compact ? 5 : 8)))
    for (let i = 0; i < years; i += xStep) {
      ctx.fillText(`${currentAge + i}`, x(i), H - 14)
    }
    ctx.fillText(`${currentAge + years - 1}`, x(years - 1), H - 14)
    ctx.fillText(t('result.age'), pad.left + plotW / 2, H)

    ctx.textAlign = 'right'
    const ySteps = compact ? 4 : 5
    for (let s = 0; s <= ySteps; s++) {
      const val = (maxVal / ySteps) * s
      ctx.fillText(formatCurrency(val, region, language), pad.left - 8, y(val) + 4)
    }
  }, [axisColor, chartWidth, currentAge, gridColor, labelColor, language, percentiles, primary, region, retirementAge, t])

  return (
    <Box ref={containerRef} sx={{ width: '100%', minWidth: 0 }}>
      <canvas ref={canvasRef} />
    </Box>
  )
}
