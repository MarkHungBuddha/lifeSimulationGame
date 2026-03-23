import {
  Box, Typography, Slider, Divider, Button, MenuItem, Select,
  FormControl, InputLabel, Alert, LinearProgress, Stack, Chip,
  Card, CardActionArea, CardContent, Grid, Switch, FormControlLabel,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BarChartIcon from '@mui/icons-material/BarChart'
import { useGameStore } from '../store/gameStore'
import { LIFESTYLE_LIST, type LifestyleId } from '../engine/lifestyle'
import type { Allocation } from '../engine/simulator'

const ASSET_KEYS: (keyof Allocation)[] = ['sp500', 'bond', 'gold', 'cash', 'reits']
const ASSET_META: Record<keyof Allocation, { label: string; color: string }> = {
  sp500: { label: 'S&P 500', color: '#1565c0' },
  bond:  { label: '美國長債', color: '#6a1b9a' },
  gold:  { label: '黃金', color: '#f9a825' },
  cash:  { label: '現金', color: '#2e7d32' },
  reits: { label: 'REITs', color: '#e65100' },
}

export function Controls() {
  const store = useGameStore()

  const handleAllocationChange = (key: keyof Allocation, value: number) => {
    const newAlloc = { ...store.allocation, [key]: value / 100 }
    const sum = ASSET_KEYS.reduce((s, k) => s + newAlloc[k], 0)
    if (sum > 1.001) return
    store.setAllocation(newAlloc)
  }

  const allocSum = ASSET_KEYS.reduce((s, k) => s + store.allocation[k], 0)
  const allocValid = Math.abs(allocSum - 1) <= 0.001
  const savingsRate = store.annualIncome > 0
    ? store.annualContribution / store.annualIncome : 0

  return (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* 生活風格選擇 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        生活風格
      </Typography>

      <Grid container spacing={1}>
        {LIFESTYLE_LIST.map(preset => (
          <Grid size={6} key={preset.id}>
            <Card variant={store.lifestyleId === preset.id ? 'elevation' : 'outlined'}
              elevation={store.lifestyleId === preset.id ? 4 : 0}
              sx={{
                border: store.lifestyleId === preset.id ? '2px solid' : '1px solid',
                borderColor: store.lifestyleId === preset.id ? 'primary.main' : 'divider',
                transition: 'all 0.15s',
              }}>
              <CardActionArea onClick={() => store.applyLifestyle(preset.id as Exclude<LifestyleId, 'custom'>)}>
                <CardContent sx={{ p: 1.2, '&:last-child': { pb: 1.2 } }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {preset.emoji} {preset.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {preset.tagline}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {store.lifestyleId !== 'custom' && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
          {LIFESTYLE_LIST.find(p => p.id === store.lifestyleId)?.description}
        </Typography>
      )}
      {store.lifestyleId === 'custom' && (
        <Chip size="small" label="自訂模式" color="default" variant="outlined" />
      )}

      <Divider sx={{ my: 1 }} />

      {/* 收支概況 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        收支概況
      </Typography>

      <SliderField label="年收入" value={store.annualIncome} unit=""
        min={20000} max={500000} step={5000} onChange={store.setAnnualIncome}
        format={v => `$${v.toLocaleString()}`} />
      <SliderField label="年生活開銷" value={store.annualExpense} unit=""
        min={10000} max={300000} step={5000} onChange={store.setAnnualExpense}
        format={v => `$${v.toLocaleString()}`} />
      <SliderField label="年存入投資" value={store.annualContribution} unit=""
        min={0} max={200000} step={1000} onChange={store.setAnnualContribution}
        format={v => `$${v.toLocaleString()}`} />

      <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
        <Chip size="small" variant="outlined" color={savingsRate >= 0.3 ? 'success' : savingsRate >= 0.15 ? 'warning' : 'error'}
          label={`儲蓄率 ${(savingsRate * 100).toFixed(0)}%`} />
        <Chip size="small" variant="outlined"
          label={`月開銷 $${Math.round(store.annualExpense / 12).toLocaleString()}`} />
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* 基本設定 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        基本設定
      </Typography>

      <SliderField label="現在年齡" value={store.currentAge} unit="歲"
        min={20} max={60} onChange={store.setCurrentAge} />
      <SliderField label="退休年齡" value={store.retirementAge} unit="歲"
        min={store.currentAge + 1} max={80} onChange={store.setRetirementAge} />
      <SliderField label="模擬結束" value={store.endAge} unit="歲"
        min={store.retirementAge + 1} max={100} onChange={store.setEndAge} />
      <SliderField label="起始資產" value={store.initialPortfolio} unit=""
        min={0} max={2000000} step={10000} onChange={store.setInitialPortfolio}
        format={v => `$${v.toLocaleString()}`} />

      <Divider sx={{ my: 1 }} />

      {/* 資產配置 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          資產配置
        </Typography>
        <Chip size="small" label={`${(allocSum * 100).toFixed(0)}%`}
          color={allocValid ? 'success' : 'error'} variant="outlined" />
      </Stack>

      {ASSET_KEYS.map(key => (
        <Box key={key}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: ASSET_META[key].color, fontWeight: 600 }}>
              {ASSET_META[key].label}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {(store.allocation[key] * 100).toFixed(0)}%
            </Typography>
          </Stack>
          <Slider size="small" min={0} max={100} step={5}
            value={store.allocation[key] * 100}
            onChange={(_, v) => handleAllocationChange(key, v as number)}
            sx={{ color: ASSET_META[key].color, py: 0.5 }} />
        </Box>
      ))}

      {!allocValid && (
        <Alert severity="error" variant="outlined" sx={{ py: 0 }}>
          配置總和必須為 100%
        </Alert>
      )}

      <Divider sx={{ my: 1 }} />

      {/* 提領策略 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        提領策略
      </Typography>

      <FormControl size="small" fullWidth>
        <InputLabel>策略類型</InputLabel>
        <Select label="策略類型" value={store.withdrawal.type}
          onChange={e => {
            const t = e.target.value
            if (t === 'fixed_rate') store.setWithdrawal({ type: 'fixed_rate', rate: 0.04 })
            else if (t === 'fixed_amount') store.setWithdrawal({ type: 'fixed_amount', amount: store.annualExpense })
            else store.setWithdrawal({ type: 'dynamic', floor: store.annualExpense * 0.7, ceiling: store.annualExpense * 1.5 })
          }}>
          <MenuItem value="fixed_rate">4% 法則</MenuItem>
          <MenuItem value="fixed_amount">固定金額</MenuItem>
          <MenuItem value="dynamic">動態提領</MenuItem>
        </Select>
      </FormControl>

      {store.withdrawal.type === 'fixed_rate' && (
        <SliderField label="提領率" value={store.withdrawal.rate * 100} unit="%"
          min={2} max={8} step={0.5}
          onChange={v => store.setWithdrawal({ type: 'fixed_rate', rate: v / 100 })}
          format={v => `${v.toFixed(1)}%`} />
      )}
      {store.withdrawal.type === 'fixed_amount' && (
        <SliderField label="年提領額" value={store.withdrawal.amount} unit=""
          min={10000} max={300000} step={5000}
          onChange={v => store.setWithdrawal({ type: 'fixed_amount', amount: v })}
          format={v => `$${v.toLocaleString()}`} />
      )}
      {store.withdrawal.type === 'dynamic' && (
        <>
          <SliderField label="提領下限" value={store.withdrawal.floor} unit=""
            min={10000} max={200000} step={5000}
            onChange={v => store.setWithdrawal({ ...store.withdrawal, type: 'dynamic', floor: v })}
            format={v => `$${v.toLocaleString()}`} />
          <SliderField label="提領上限" value={store.withdrawal.ceiling} unit=""
            min={20000} max={300000} step={5000}
            onChange={v => store.setWithdrawal({ ...store.withdrawal, type: 'dynamic', ceiling: v })}
            format={v => `$${v.toLocaleString()}`} />
        </>
      )}

      <Divider sx={{ my: 1 }} />

      {/* 隨機事件 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        隨機事件
      </Typography>
      <FormControlLabel
        control={
          <Switch checked={store.enableEvents}
            onChange={(_, v) => store.setEnableEvents(v)} color="warning" />
        }
        label={
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {store.enableEvents ? '已啟用' : '未啟用'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              市場崩盤、失業、疾病、家庭事件等 24 種隨機事件
            </Typography>
          </Stack>
        }
      />

      <Divider sx={{ my: 1 }} />

      {/* 模擬設定 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        模擬設定
      </Typography>
      <SliderField label="路徑數" value={store.numPaths} unit=""
        min={1000} max={50000} step={1000} onChange={store.setNumPaths}
        format={v => v.toLocaleString()} />

      {/* 頁面切換 */}
      <ToggleButtonGroup fullWidth size="small" exclusive
        value={store.viewMode} onChange={(_, v) => v && store.setViewMode(v)}
        sx={{ mb: 1 }}>
        <ToggleButton value="simulation">
          <BarChartIcon sx={{ mr: 0.5, fontSize: 18 }} /> 批次模擬
        </ToggleButton>
        <ToggleButton value="story">
          <AutoStoriesIcon sx={{ mr: 0.5, fontSize: 18 }} /> 人生故事
        </ToggleButton>
      </ToggleButtonGroup>

      {store.isRunning && (
        <LinearProgress variant="determinate" value={store.progress * 100}
          sx={{ borderRadius: 1 }} />
      )}

      {store.viewMode === 'simulation' ? (
        <Button variant="contained" size="large" fullWidth
          disabled={store.isRunning || !allocValid}
          onClick={store.runSimulation}
          startIcon={store.isRunning ? <HourglassTopIcon /> : <PlayArrowIcon />}
          sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16 }}>
          {store.isRunning ? `模擬中 ${(store.progress * 100).toFixed(0)}%` : '執行模擬'}
        </Button>
      ) : (
        <Button variant="contained" size="large" fullWidth color="secondary"
          disabled={store.isStoryRunning || !allocValid}
          onClick={store.runStory}
          startIcon={<AutoStoriesIcon />}
          sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16 }}>
          {store.isStoryRunning ? '生成中...' : '生成人生故事'}
        </Button>
      )}
    </Box>
  )
}

function SliderField({ label, value, unit, min, max, step = 1, onChange, format }: {
  label: string; value: number; unit: string
  min: number; max: number; step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const display = format ? format(value) : `${value} ${unit}`
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={700}>{display}</Typography>
      </Stack>
      <Slider size="small" min={min} max={max} step={step} value={value}
        onChange={(_, v) => onChange(v as number)} sx={{ py: 0.5 }} />
    </Box>
  )
}
