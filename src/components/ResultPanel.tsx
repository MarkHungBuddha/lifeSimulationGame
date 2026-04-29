import {
  Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, useTheme,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import WarningIcon from '@mui/icons-material/Warning'
import InsightsIcon from '@mui/icons-material/Insights'
import SavingsIcon from '@mui/icons-material/Savings'
import { useI18n } from '../i18n'
import type { UiLanguage } from '../i18n/types'
import { useGameStore } from '../store/gameStore'
import { LIFESTYLE_PRESETS } from '../engine/lifestyle'
import { LIFESTYLE_PRESETS_TW } from '../engine/lifestyle_tw'
import { LIFESTYLE_PRESETS_JP } from '../engine/lifestyle_jp'
import { getPhilippinesLifestylePresets } from '../engine/lifestyle_ph'
import { formatCurrency, formatSliderValue, isPhilippinesRegion, type Region } from '../config/regions'

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
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '80vh', color: 'text.disabled',
      }}>
        <InsightsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
        <Typography variant="h5">{t('result.empty_title')}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t('result.empty_body')}
        </Typography>
      </Box>
    )
  }

  const rate = result.successRate
  const rateColor = rate >= 0.8 ? 'success' : rate >= 0.5 ? 'warning' : 'error'
  const rateHex = rate >= 0.8 ? '#2e7d32' : rate >= 0.5 ? '#ed6c02' : '#d32f2f'
  const lifestylePreset = lifestyleId !== 'custom'
    ? presets[lifestyleId as keyof typeof presets]
    : null

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <SavingsIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            {t('result.summary_title')}
            {lifestylePreset ? ` — ${lifestylePreset.emoji} ${lifestylePreset.name}` : ''}
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.annual_income')}</Typography>
            <Typography variant="body1" fontWeight={700}>{fmtSlider(annualIncome)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.annual_expense')}</Typography>
            <Typography variant="body1" fontWeight={700}>{fmtSlider(annualExpense)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">{t('result.annual_contribution')}</Typography>
            <Typography variant="body1" fontWeight={700}>{fmtSlider(annualContribution)}</Typography>
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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('result.summary_line', {
            monthlyExpense: fmtSlider(Math.round(annualExpense / 12)),
            retirementAge,
            workYears: retirementAge - currentAge,
          })}
          {lifestylePreset ? ` ・ ${lifestylePreset.description}` : ''}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{
        p: { xs: 2.5, sm: 4 }, mb: { xs: 2, sm: 3 }, textAlign: 'center',
        background: `linear-gradient(135deg, ${rateHex}11, ${rateHex}08)`,
        border: `1px solid ${rateHex}33`,
      }}>
        <Typography sx={{
          fontWeight: 800, color: rateHex, lineHeight: 1,
          fontSize: { xs: '3rem', sm: '4rem', md: '6rem' },
        }}>
          {(rate * 100).toFixed(1)}%
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Chip icon={<TrendingUpIcon />} label={t('result.hero_label')} color={rateColor} variant="outlined" />
          <Chip label={t('result.paths', { count: result.numPaths.toLocaleString(locale) })} variant="outlined" size="small" />
        </Stack>
      </Paper>

      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard icon={<AccountBalanceIcon />} label={t('result.median_final_portfolio')}
            value={fmt(result.medianFinalPortfolio)} color="#1565c0" />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            icon={<WarningIcon />}
            label={t('result.median_depletion_age')}
            value={result.medianDepletionAge ? t('result.age_suffix', { age: result.medianDepletionAge.toFixed(0) }) : t('result.not_depleted')}
            color={result.medianDepletionAge ? '#d32f2f' : '#2e7d32'}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard icon={<TrendingUpIcon />} label={t('result.p90_final_portfolio')}
            value={fmt(result.percentiles.p90[result.percentiles.p90.length - 1])} color="#1565c0" />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard icon={<TrendingUpIcon />} label={t('result.p10_final_portfolio')}
            value={fmt(result.percentiles.p10[result.percentiles.p10.length - 1])} color="#e65100" />
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          {t('result.drawdown_title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: { xs: 'none', sm: 'block' } }}>
          {t('result.drawdown_body')}
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_median')}
              value={`-${(result.maxDrawdown.median * 100).toFixed(1)}%`} color={result.maxDrawdown.median > 0.3 ? '#d32f2f' : '#e65100'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_p75')}
              value={`-${(result.maxDrawdown.p75 * 100).toFixed(1)}%`} color={result.maxDrawdown.p75 > 0.4 ? '#d32f2f' : '#e65100'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_p90')}
              value={`-${(result.maxDrawdown.p90 * 100).toFixed(1)}%`} color="#d32f2f" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label={t('result.drawdown_worst')}
              value={`-${(result.maxDrawdown.worst * 100).toFixed(1)}%`} color="#b71c1c" />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          {t('result.chart_title')}
        </Typography>
        <Box sx={{ overflowX: 'auto', mx: { xs: -0.5, sm: 0 } }}>
          <Box sx={{ minWidth: 480 }}>
            <PercentileChart
              percentiles={result.percentiles}
              currentAge={currentAge}
              retirementAge={retirementAge}
              region={region}
              language={language}
              t={t}
            />
          </Box>
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 1.5, justifyContent: 'center' }} flexWrap="wrap" useFlexGap>
          <Legend color="rgba(21,101,192,0.12)" label={t('result.legend_p10_p90')} />
          <Legend color="rgba(21,101,192,0.28)" label={t('result.legend_p25_p75')} />
          <Legend color="#1565c0" label={t('result.legend_p50')} line />
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          {t('result.table_title')}
        </Typography>
        <TableContainer sx={{ maxHeight: { xs: 400, sm: 'none' } }}>
          <Table size="small" sx={{ '& .MuiTableCell-root': { px: { xs: 0.5, sm: 2 }, whiteSpace: 'nowrap', fontSize: { xs: 12, sm: 14 } } }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('result.age')}</TableCell>
                <TableCell align="right" sx={{ color: '#d32f2f' }}>P10</TableCell>
                <TableCell align="right" sx={{ color: '#e65100' }}>P25</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>P50</TableCell>
                <TableCell align="right" sx={{ color: '#2e7d32' }}>P75</TableCell>
                <TableCell align="right" sx={{ color: '#1565c0' }}>P90</TableCell>
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
                  <TableCell align="right" sx={{ color: '#d32f2f' }}>
                    {fmt(result.percentiles.p10[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#e65100' }}>
                    {fmt(result.percentiles.p25[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {fmt(result.percentiles.p50[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#2e7d32' }}>
                    {fmt(result.percentiles.p75[i])}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#1565c0' }}>
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

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
      <Box sx={{ color, mb: 0.5, '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 24 } } }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" noWrap>{label}</Typography>
      <Typography fontWeight={700} noWrap sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>{value}</Typography>
    </Paper>
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
  const primary = theme.palette.primary.main

  const isDark = theme.palette.mode === 'dark'
  const gridColor = isDark ? '#444' : '#e0e0e0'
  const axisColor = isDark ? '#666' : '#bdbdbd'
  const labelColor = isDark ? '#aaa' : '#757575'

  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = 800
    const H = 380
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = '100%'
    canvas.style.maxWidth = `${W}px`
    canvas.style.height = 'auto'

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 20, right: 24, bottom: 44, left: 72 }
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom

    const years = percentiles.p50.length
    const maxVal = Math.max(...percentiles.p90) * 1.08

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
      ctx.strokeStyle = '#ff980088'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(x(retireYear), pad.top)
      ctx.lineTo(x(retireYear), pad.top + plotH)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#ff9800'
      ctx.font = '12px "Noto Sans TC", sans-serif'
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
    ctx.font = '12px "Noto Sans TC", sans-serif'
    ctx.textAlign = 'center'
    const xStep = Math.max(1, Math.floor(years / 8))
    for (let i = 0; i < years; i += xStep) {
      ctx.fillText(`${currentAge + i}`, x(i), H - 14)
    }
    ctx.fillText(`${currentAge + years - 1}`, x(years - 1), H - 14)
    ctx.fillText(t('result.age'), pad.left + plotW / 2, H)

    ctx.textAlign = 'right'
    for (let s = 0; s <= 5; s++) {
      const val = (maxVal / 5) * s
      ctx.fillText(formatCurrency(val, region, language), pad.left - 8, y(val) + 4)
    }
  }

  return <canvas ref={canvasRef} />
}
