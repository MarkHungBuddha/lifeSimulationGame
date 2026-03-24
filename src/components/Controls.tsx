import {
  Box, Typography, Slider, Divider, Button, MenuItem, Select,
  FormControl, InputLabel, Alert, LinearProgress, Stack, Chip, Paper,
  Card, CardActionArea, CardContent, Grid, Switch, FormControlLabel,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BarChartIcon from '@mui/icons-material/BarChart'
import { useGameStore } from '../store/gameStore'
import { LIFESTYLE_LIST, type LifestyleId } from '../engine/lifestyle'
import { LIFESTYLE_LIST_TW } from '../engine/lifestyle_tw'
import { LIFESTYLE_LIST_JP } from '../engine/lifestyle_jp'
import type { Allocation } from '../engine/simulator'
import { REGION_CONFIGS, formatSliderValue, formatCurrency, type Region } from '../config/regions'
import { EVENT_DATABASE } from '../events/eventDatabase'
import { EVENT_DATABASE_TW } from '../events/eventDatabase_tw'
import { EVENT_DATABASE_JP } from '../events/eventDatabase_jp'
import { HOUSING_PARAMS } from '../engine/housingData'

const ASSET_KEYS: (keyof Allocation)[] = ['sp500', 'intlStock', 'bond', 'gold', 'cash', 'reits']
const ASSET_COLORS: Record<keyof Allocation, string> = {
  sp500: '#1565c0',
  intlStock: '#0d47a1',
  bond: '#6a1b9a',
  gold: '#f9a825',
  cash: '#2e7d32',
  reits: '#e65100',
}

const ZERO_ALLOCATION: Allocation = { sp500: 0, intlStock: 0, bond: 0, gold: 0, cash: 0, reits: 0 }

export function Controls() {
  const store = useGameStore()
  const region = store.region
  const cfg = REGION_CONFIGS[region]
  const lifestyleList = region === 'jp' ? LIFESTYLE_LIST_JP : region === 'tw' ? LIFESTYLE_LIST_TW : LIFESTYLE_LIST
  const eventCount = region === 'jp' ? EVENT_DATABASE_JP.length : region === 'tw' ? EVENT_DATABASE_TW.length : EVENT_DATABASE.length
  const r = cfg.sliderRanges

  const handleAllocationChange = (key: keyof Allocation, value: number) => {
    const newAlloc = { ...store.allocation, [key]: value / 100 }
    const sum = ASSET_KEYS.reduce((s, k) => s + newAlloc[k], 0)
    if (sum > 1.001) return
    store.setAllocation(newAlloc)
  }

  const handleImmAllocationChange = (key: keyof Allocation, value: number) => {
    const newAlloc = { ...store.immigrationAllocation, [key]: value / 100 }
    const sum = ASSET_KEYS.reduce((s, k) => s + newAlloc[k], 0)
    if (sum > 1.001) return
    store.setImmigrationAllocation(newAlloc)
  }

  const immAllocSum = ASSET_KEYS.reduce((s, k) => s + store.immigrationAllocation[k], 0)
  const immAllocValid = Math.abs(immAllocSum - 1) <= 0.001

  const allocSum = ASSET_KEYS.reduce((s, k) => s + store.allocation[k], 0)
  const allocValid = Math.abs(allocSum - 1) <= 0.001
  const savingsRate = store.annualIncome > 0
    ? store.annualContribution / store.annualIncome : 0
  const fmtVal = (v: number) => formatSliderValue(v, region)
  const fmtMonthly = (v: number) => formatSliderValue(Math.round(v / 12), region)

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* 地區切換 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        地區版本
      </Typography>
      <ToggleButtonGroup fullWidth size="small" exclusive
        value={region} onChange={(_, v) => v && store.setRegion(v as Region)}
        sx={{ mb: 0.5 }}>
        <ToggleButton value="us">
          🇺🇸 USD
        </ToggleButton>
        <ToggleButton value="tw">
          🇹🇼 TWD
        </ToggleButton>
        <ToggleButton value="jp">
          🇯🇵 JPY
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 1 }} />

      {/* 生活風格選擇 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        生活風格
      </Typography>

      <Grid container spacing={1}>
        {lifestyleList.map(preset => (
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
          {lifestyleList.find(p => p.id === store.lifestyleId)?.description}
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
        min={r.annualIncome.min} max={r.annualIncome.max} step={r.annualIncome.step}
        onChange={store.setAnnualIncome} format={fmtVal} />
      <SliderField label="年生活開銷" value={store.annualExpense} unit=""
        min={r.annualExpense.min} max={r.annualExpense.max} step={r.annualExpense.step}
        onChange={store.setAnnualExpense} format={fmtVal} />
      <SliderField label="年存入投資" value={store.annualContribution} unit=""
        min={r.annualContribution.min} max={r.annualContribution.max} step={r.annualContribution.step}
        onChange={store.setAnnualContribution} format={fmtVal} />

      <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
        <Chip size="small" variant="outlined" color={savingsRate >= 0.3 ? 'success' : savingsRate >= 0.15 ? 'warning' : 'error'}
          label={`儲蓄率 ${(savingsRate * 100).toFixed(0)}%`} />
        <Chip size="small" variant="outlined"
          label={`月開銷 ${fmtMonthly(store.annualExpense)}`} />
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
        min={r.initialPortfolio.min} max={r.initialPortfolio.max} step={r.initialPortfolio.step}
        onChange={store.setInitialPortfolio} format={fmtVal} />

      <Divider sx={{ my: 1 }} />

      {/* 資產配置 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          資產配置
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Chip size="small" label="全部歸零" variant="outlined" clickable
            onClick={() => store.setAllocation({ ...ZERO_ALLOCATION })} />
          <Chip size="small" label={`${(allocSum * 100).toFixed(0)}%`}
            color={allocValid ? 'success' : 'error'} variant="outlined" />
        </Stack>
      </Stack>

      {ASSET_KEYS.map(key => (
        <Box key={key}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: ASSET_COLORS[key], fontWeight: 600 }}>
              {cfg.assetLabels[key]}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {(store.allocation[key] * 100).toFixed(0)}%
            </Typography>
          </Stack>
          <Slider size="small" min={0} max={100} step={5}
            value={store.allocation[key] * 100}
            onChange={(_, v) => handleAllocationChange(key, v as number)}
            sx={{ color: ASSET_COLORS[key], py: 0.5 }} />
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
          min={r.withdrawalAmount.min} max={r.withdrawalAmount.max} step={r.withdrawalAmount.step}
          onChange={v => store.setWithdrawal({ type: 'fixed_amount', amount: v })}
          format={fmtVal} />
      )}
      {store.withdrawal.type === 'dynamic' && (
        <>
          <SliderField label="提領下限" value={store.withdrawal.floor} unit=""
            min={r.withdrawalFloor.min} max={r.withdrawalFloor.max} step={r.withdrawalFloor.step}
            onChange={v => store.setWithdrawal({ type: 'dynamic', floor: v, ceiling: store.withdrawal.type === 'dynamic' ? store.withdrawal.ceiling : v * 2 })}
            format={fmtVal} />
          <SliderField label="提領上限" value={store.withdrawal.ceiling} unit=""
            min={r.withdrawalCeiling.min} max={r.withdrawalCeiling.max} step={r.withdrawalCeiling.step}
            onChange={v => store.setWithdrawal({ type: 'dynamic', floor: store.withdrawal.type === 'dynamic' ? store.withdrawal.floor : v / 2, ceiling: v })}
            format={fmtVal} />
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
              {region === 'jp'
                ? `日経暴落、大地震、過労、介護等 ${eventCount} 種日本版ランダムイベント`
                : region === 'tw'
                ? `台股崩盤、台海危機、颱風地震等 ${eventCount} 種台灣版隨機事件`
                : `市場崩盤、失業、疾病、家庭事件等 ${eventCount} 種隨機事件`}
            </Typography>
          </Stack>
        }
      />

      <Divider sx={{ my: 1 }} />

      {/* 購屋計畫 */}
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        購屋計畫
      </Typography>
      <FormControlLabel
        control={
          <Switch checked={store.housingEnabled}
            onChange={(_, v) => store.setHousingEnabled(v)} color="success" />
        }
        label={
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {store.housingEnabled ? '計畫購屋' : '不買房'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              模擬自住房購買對長期財務的影響
            </Typography>
          </Stack>
        }
      />
      {store.housingEnabled && (() => {
        const hp = HOUSING_PARAMS[region]
        const effectiveRegion = store.immigrationEnabled && store.immigrationTarget ? store.immigrationTarget : region
        const ehp = HOUSING_PARAMS[effectiveRegion]
        const estimatedPrice = store.annualIncome * store.housingPriceToIncomeRatio
        const downPayment = estimatedPrice * store.housingDownPaymentRatio
        const loanAmount = estimatedPrice - downPayment
        const closingCost = estimatedPrice * ehp.closingCostRatio
        // 簡易月付估算
        const monthlyRate = ehp.mortgageRate / 12
        const totalMonths = store.housingMortgageYears * 12
        const monthlyPayment = monthlyRate > 0
          ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
          : loanAmount / totalMonths

        return (
          <>
            <SliderField label="購屋年齡" value={store.housingPurchaseAge} unit="歲"
              min={store.currentAge} max={store.retirementAge}
              onChange={store.setHousingPurchaseAge} />

            <SliderField label="房價所得比" value={store.housingPriceToIncomeRatio} unit="倍"
              min={hp.priceToIncomeRange.min} max={hp.priceToIncomeRange.max}
              step={hp.priceToIncomeRange.step}
              onChange={store.setHousingPriceToIncomeRatio}
              format={v => `${v} 倍`} />

            <SliderField label="頭期款比例" value={store.housingDownPaymentRatio * 100} unit="%"
              min={10} max={50} step={5}
              onChange={v => store.setHousingDownPaymentRatio(v / 100)}
              format={v => `${v.toFixed(0)}%`} />

            <FormControl size="small" fullWidth>
              <InputLabel>房貸年限</InputLabel>
              <Select label="房貸年限" value={store.housingMortgageYears}
                onChange={e => store.setHousingMortgageYears(e.target.value as number)}>
                {hp.mortgageYearsOptions.map(y => (
                  <MenuItem key={y} value={y}>{y} 年</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'action.hover' }}>
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">預估房價</Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {formatCurrency(estimatedPrice, region)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">頭期款+交易成本</Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {formatCurrency(downPayment + closingCost, region)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">月付房貸</Typography>
                  <Typography variant="caption" fontWeight={700} color="warning.main">
                    {formatCurrency(Math.round(monthlyPayment), region)}/月
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">房貸利率</Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {(ehp.mortgageRate * 100).toFixed(1)}%
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
              {region === 'tw'
                ? '購屋後房貸+持有成本將從年投資額中扣除，頭期款+交易成本從投資組合中扣除'
                : region === 'jp'
                ? '購入後、住宅ローン+維持費は年間投資額から控除、頭金+諸費用は投資ポートフォリオから控除'
                : 'Mortgage + holding costs reduce annual investment; down payment + closing costs deducted from portfolio'}
            </Typography>
          </>
        )
      })()}

      <Divider sx={{ my: 1 }} />

      {/* 移民計畫 */}
      {region === 'tw' && (
        <>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            移民計畫
          </Typography>
          <FormControlLabel
            control={
              <Switch checked={store.immigrationEnabled}
                onChange={(_, v) => store.setImmigrationEnabled(v)} color="info" />
            }
            label={
              <Stack>
                <Typography variant="body2" fontWeight={600}>
                  {store.immigrationEnabled ? '已規劃移民' : '未規劃'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  模擬從台灣移民到日本或美國的完整路徑
                </Typography>
              </Stack>
            }
          />
          {store.immigrationEnabled && (
            <>
              <ToggleButtonGroup fullWidth size="small" exclusive
                value={store.immigrationTarget}
                onChange={(_, v) => v && store.setImmigrationTarget(v)}
                sx={{ mb: 0.5 }}>
                <ToggleButton value="jp">🇯🇵 移民日本</ToggleButton>
                <ToggleButton value="us">🇺🇸 移民美國</ToggleButton>
              </ToggleButtonGroup>
              {store.immigrationTarget && (
                <>
                  <SliderField label="開始準備年齡" value={store.immigrationAge} unit="歲"
                    min={store.currentAge + 1} max={store.retirementAge - 5}
                    onChange={store.setImmigrationAge} />
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {store.immigrationTarget === 'jp'
                      ? '🇯🇵 日語學習→求職→COE申請（簽證成功率85%）→定居→永住（HSP最快1-3年）'
                      : '🇺🇸 英語準備→求職→H-1B抽籤（每次25%，最多3次）→定居→綠卡（EB-2約3年）'}
                  </Typography>

                  {/* 移民後投資配置 */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      移民後投資配置
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Chip size="small" label="全部歸零" variant="outlined" clickable
                        onClick={() => store.setImmigrationAllocation({ ...ZERO_ALLOCATION })} />
                      <Chip size="small" label={`${(immAllocSum * 100).toFixed(0)}%`}
                        color={immAllocValid ? 'success' : 'error'} variant="outlined" />
                    </Stack>
                  </Stack>

                  {ASSET_KEYS.map(key => {
                    const targetCfg = REGION_CONFIGS[store.immigrationTarget!]
                    return (
                      <Box key={`imm-${key}`}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: ASSET_COLORS[key], fontWeight: 600 }}>
                            {targetCfg.assetLabels[key]}
                          </Typography>
                          <Typography variant="caption" fontWeight={700}>
                            {(store.immigrationAllocation[key] * 100).toFixed(0)}%
                          </Typography>
                        </Stack>
                        <Slider size="small" min={0} max={100} step={5}
                          value={store.immigrationAllocation[key] * 100}
                          onChange={(_, v) => handleImmAllocationChange(key, v as number)}
                          sx={{ color: ASSET_COLORS[key], py: 0.3 }} />
                      </Box>
                    )
                  })}

                  {!immAllocValid && (
                    <Alert severity="error" variant="outlined" sx={{ py: 0 }}>
                      配置總和必須為 100%
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
          <Divider sx={{ my: 1 }} />
        </>
      )}

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
          disabled={store.isRunning || !allocValid || (store.immigrationEnabled && !!store.immigrationTarget && !immAllocValid)}
          onClick={store.runSimulation}
          startIcon={store.isRunning ? <HourglassTopIcon /> : <PlayArrowIcon />}
          sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16 }}>
          {store.isRunning ? `模擬中 ${(store.progress * 100).toFixed(0)}%` : '執行模擬'}
        </Button>
      ) : (
        <Button variant="contained" size="large" fullWidth color="secondary"
          disabled={store.isStoryRunning || !allocValid || (store.immigrationEnabled && !!store.immigrationTarget && !immAllocValid)}
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
