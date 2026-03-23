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
import { useGameStore } from '../store/gameStore'
import { LIFESTYLE_PRESETS } from '../engine/lifestyle'
import { LIFESTYLE_PRESETS_TW } from '../engine/lifestyle_tw'
import { formatCurrency, formatSliderValue, type Region } from '../config/regions'

export function ResultPanel() {
  const result = useGameStore(s => s.result)
  const currentAge = useGameStore(s => s.currentAge)
  const retirementAge = useGameStore(s => s.retirementAge)
  const lifestyleId = useGameStore(s => s.lifestyleId)
  const annualIncome = useGameStore(s => s.annualIncome)
  const annualExpense = useGameStore(s => s.annualExpense)
  const annualContribution = useGameStore(s => s.annualContribution)
  const region = useGameStore(s => s.region)
  const presets = region === 'tw' ? LIFESTYLE_PRESETS_TW : LIFESTYLE_PRESETS
  const fmt = (v: number) => formatCurrency(v, region)
  const fmtSlider = (v: number) => formatSliderValue(v, region)

  if (!result) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '80vh', color: 'text.disabled',
      }}>
        <InsightsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
        <Typography variant="h5">調整左側參數後按「執行模擬」</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          將以 Block Bootstrap 重抽樣歷史資料進行蒙地卡羅模擬
        </Typography>
      </Box>
    )
  }

  const rate = result.successRate
  const rateColor = rate >= 0.8 ? 'success' : rate >= 0.5 ? 'warning' : 'error'
  const rateHex = rate >= 0.8 ? '#2e7d32' : rate >= 0.5 ? '#ed6c02' : '#d32f2f'

  return (
    <Box sx={{ p: 3 }}>
      {/* 生活風格摘要 */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <SavingsIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            生活風格摘要
            {lifestyleId !== 'custom' && (() => {
              const preset = presets[lifestyleId as keyof typeof presets]
              return preset ? ` — ${preset.emoji} ${preset.name}` : ''
            })()}
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">年收入</Typography>
            <Typography variant="body1" fontWeight={700}>{fmtSlider(annualIncome)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">年開銷</Typography>
            <Typography variant="body1" fontWeight={700}>{fmtSlider(annualExpense)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">年投資</Typography>
            <Typography variant="body1" fontWeight={700}>{fmtSlider(annualContribution)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">儲蓄率</Typography>
            <Typography variant="body1" fontWeight={700}
              color={annualIncome > 0 && annualContribution / annualIncome >= 0.3 ? 'success.main' : 'text.primary'}>
              {annualIncome > 0 ? `${(annualContribution / annualIncome * 100).toFixed(0)}%` : '—'}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          月開銷 {fmtSlider(Math.round(annualExpense / 12))} ・
          退休年齡 {retirementAge} 歲 ・
          工作年數 {retirementAge - currentAge} 年
          {lifestyleId !== 'custom' && (() => {
            const preset = presets[lifestyleId as keyof typeof presets]
            return preset ? ` ・ ${preset.description}` : ''
          })()}
        </Typography>
      </Paper>

      {/* 成功率 Hero */}
      <Paper elevation={2} sx={{
        p: 4, mb: 3, textAlign: 'center',
        background: `linear-gradient(135deg, ${rateHex}11, ${rateHex}08)`,
        border: `1px solid ${rateHex}33`,
      }}>
        <Typography variant="h1" sx={{ fontWeight: 800, color: rateHex, lineHeight: 1 }}>
          {(rate * 100).toFixed(1)}%
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }}>
          <Chip icon={<TrendingUpIcon />} label="退休存活率" color={rateColor} variant="outlined" />
          <Chip label={`${result.numPaths.toLocaleString()} 條路徑`} variant="outlined" size="small" />
        </Stack>
      </Paper>

      {/* 統計卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<AccountBalanceIcon />} label="中位最終資產"
            value={fmt(result.medianFinalPortfolio)} color="#1565c0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<WarningIcon />} label="中位破產年齡"
            value={result.medianDepletionAge ? `${result.medianDepletionAge.toFixed(0)} 歲` : '未破產'}
            color={result.medianDepletionAge ? '#d32f2f' : '#2e7d32'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<TrendingUpIcon />} label="P90 最終資產"
            value={fmt(result.percentiles.p90[result.percentiles.p90.length - 1])}
            color="#1565c0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<TrendingUpIcon />} label="P10 最終資產"
            value={fmt(result.percentiles.p10[result.percentiles.p10.length - 1])}
            color="#e65100" />
        </Grid>
      </Grid>

      {/* 最大跌幅卡片 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          最大跌幅（Max Drawdown）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          模擬期間內，資產從高峰到低谷的最大跌幅百分比
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label="中位跌幅"
              value={`-${(result.maxDrawdown.median * 100).toFixed(1)}%`}
              color={result.maxDrawdown.median > 0.3 ? '#d32f2f' : '#e65100'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label="P75 跌幅"
              value={`-${(result.maxDrawdown.p75 * 100).toFixed(1)}%`}
              color={result.maxDrawdown.p75 > 0.4 ? '#d32f2f' : '#e65100'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label="P90 跌幅"
              value={`-${(result.maxDrawdown.p90 * 100).toFixed(1)}%`}
              color="#d32f2f" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard icon={<TrendingDownIcon />} label="最大跌幅"
              value={`-${(result.maxDrawdown.worst * 100).toFixed(1)}%`}
              color="#b71c1c" />
          </Grid>
        </Grid>
      </Paper>

      {/* Percentile Band Chart */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          資產走勢 — Percentile Band Chart
        </Typography>
        <PercentileChart percentiles={result.percentiles}
          currentAge={currentAge} retirementAge={retirementAge} region={region} />
        <Stack direction="row" spacing={2} sx={{ mt: 1.5, justifyContent: 'center' }}>
          <Legend color="rgba(21,101,192,0.12)" label="P10 – P90" />
          <Legend color="rgba(21,101,192,0.28)" label="P25 – P75" />
          <Legend color="#1565c0" label="P50 中位數" line />
        </Stack>
      </Paper>

      {/* Percentile 表格 */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          各年百分位資產值
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>年齡</TableCell>
                <TableCell align="right" sx={{ color: '#d32f2f' }}>P10</TableCell>
                <TableCell align="right" sx={{ color: '#e65100' }}>P25</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>P50</TableCell>
                <TableCell align="right" sx={{ color: '#2e7d32' }}>P75</TableCell>
                <TableCell align="right" sx={{ color: '#1565c0' }}>P90</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getTableRows(result.percentiles.p50.length).map(i => (
                <TableRow key={i} hover
                  sx={currentAge + i === retirementAge ? {
                    bgcolor: 'action.hover', borderLeft: '3px solid', borderColor: 'primary.main',
                  } : undefined}>
                  <TableCell>
                    {currentAge + i}
                    {currentAge + i === retirementAge && (
                      <Chip label="退休" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: 11 }} />
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

/** 統計卡片 */
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
    </Paper>
  )
}

/** 圖例 */
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

function formatMoney(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toFixed(0)
}

function getTableRows(totalYears: number): number[] {
  const rows: number[] = []
  for (let i = 0; i < totalYears; i += 5) rows.push(i)
  if (rows[rows.length - 1] !== totalYears - 1) rows.push(totalYears - 1)
  return rows
}

/** Canvas Percentile Band Chart with MUI theme colors */
function PercentileChart({ percentiles, currentAge, retirementAge, region }: {
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] }
  currentAge: number
  retirementAge: number
  region: Region
}) {
  const theme = useTheme()
  const primary = theme.palette.primary.main

  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = 800
    const H = 380
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = '100%'
    canvas.style.maxWidth = W + 'px'
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

    // Grid lines
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 0.5
    for (let s = 1; s <= 5; s++) {
      const val = (maxVal / 5) * s
      ctx.beginPath()
      ctx.moveTo(pad.left, y(val))
      ctx.lineTo(W - pad.right, y(val))
      ctx.stroke()
    }

    // P10-P90 band
    ctx.fillStyle = `${primary}1F`
    ctx.beginPath()
    for (let i = 0; i < years; i++) ctx.lineTo(x(i), y(percentiles.p90[i]))
    for (let i = years - 1; i >= 0; i--) ctx.lineTo(x(i), y(percentiles.p10[i]))
    ctx.closePath()
    ctx.fill()

    // P25-P75 band
    ctx.fillStyle = `${primary}47`
    ctx.beginPath()
    for (let i = 0; i < years; i++) ctx.lineTo(x(i), y(percentiles.p75[i]))
    for (let i = years - 1; i >= 0; i--) ctx.lineTo(x(i), y(percentiles.p25[i]))
    ctx.closePath()
    ctx.fill()

    // P50 line
    ctx.strokeStyle = primary
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (let i = 0; i < years; i++) {
      if (i === 0) ctx.moveTo(x(i), y(percentiles.p50[i]))
      else ctx.lineTo(x(i), y(percentiles.p50[i]))
    }
    ctx.stroke()

    // Retirement vertical line
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
      ctx.fillText('退休', x(retireYear), pad.top - 6)
    }

    // Zero line
    ctx.strokeStyle = '#ef535088'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(pad.left, y(0))
    ctx.lineTo(W - pad.right, y(0))
    ctx.stroke()
    ctx.setLineDash([])

    // Axes
    ctx.strokeStyle = '#bdbdbd'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad.left, pad.top)
    ctx.lineTo(pad.left, pad.top + plotH)
    ctx.lineTo(W - pad.right, pad.top + plotH)
    ctx.stroke()

    // X labels
    ctx.fillStyle = '#757575'
    ctx.font = '12px "Noto Sans TC", sans-serif'
    ctx.textAlign = 'center'
    const xStep = Math.max(1, Math.floor(years / 8))
    for (let i = 0; i < years; i += xStep) {
      ctx.fillText(`${currentAge + i}`, x(i), H - 14)
    }
    ctx.fillText(`${currentAge + years - 1}`, x(years - 1), H - 14)
    ctx.fillText('年齡', pad.left + plotW / 2, H - 0)

    // Y labels
    ctx.textAlign = 'right'
    for (let s = 0; s <= 5; s++) {
      const val = (maxVal / 5) * s
      ctx.fillText(formatCurrency(val, region), pad.left - 8, y(val) + 4)
    }
  }

  return <canvas ref={canvasRef} />
}
