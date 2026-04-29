import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BarChartIcon from '@mui/icons-material/BarChart'
import SaveIcon from '@mui/icons-material/Save'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { useI18n } from '../i18n'
import type { UiLanguage } from '../i18n/types'
import { EVENT_DATABASE } from '../events/eventDatabase'
import { EVENT_DATABASE_JP } from '../events/eventDatabase_jp'
import { EVENT_DATABASE_TW } from '../events/eventDatabase_tw'
import { HOUSING_PARAMS } from '../engine/housingData'
import { getPhilippinesLifestyleList } from '../engine/lifestyle_ph'
import { LIFESTYLE_LIST, type LifestyleId } from '../engine/lifestyle'
import { LIFESTYLE_LIST_JP } from '../engine/lifestyle_jp'
import { LIFESTYLE_LIST_TW } from '../engine/lifestyle_tw'
import { OCCUPATIONS, OCCUPATION_MAP } from '../engine/occupationData'
import type { Allocation } from '../engine/simulator'
import {
  REGION_CONFIGS,
  formatCurrency,
  formatSliderValue,
  getAssetLabel,
  getRegionLabel,
  isPhilippinesRegion,
  type Region,
} from '../config/regions'
import { useGameStore } from '../store/gameStore'
import { useSavedRecords } from '../store/savedRecords'
import { SavedRecordsDialog } from './SavedRecordsDialog'

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

const COPY: Record<UiLanguage, Record<string, string>> = {
  en: {
    region: 'Region',
    lifestyle: 'Lifestyle',
    custom: 'Custom',
    finances: 'Finances',
    annualIncome: 'Annual income',
    annualExpense: 'Annual expense',
    annualContribution: 'Annual invest',
    savingsRate: 'Savings rate',
    monthlyExpense: 'Monthly expense',
    timeline: 'Timeline',
    currentAge: 'Current age',
    retirementAge: 'Retirement age',
    endAge: 'End age',
    initialPortfolio: 'Initial portfolio',
    allocation: 'Portfolio allocation',
    clear: 'Clear',
    allocationError: 'Allocation total must not exceed 100%',
    withdrawal: 'Withdrawal strategy',
    withdrawalType: 'Withdrawal type',
    fixedRate: '4% rule',
    fixedAmount: 'Fixed amount',
    dynamic: 'Dynamic withdrawal',
    withdrawalRate: 'Withdrawal rate',
    withdrawalAmount: 'Annual withdrawal',
    withdrawalFloor: 'Withdrawal floor',
    withdrawalCeiling: 'Withdrawal ceiling',
    events: 'Random events',
    enabled: 'Enabled',
    disabled: 'Disabled',
    eventsHelp: 'Include {count} event templates in the simulation.',
    occupation: 'Occupation simulation',
    occupationHelp: 'Occupation mode affects income growth and occupation-specific events.',
    occupationLabel: 'Occupation',
    baseSalary: 'Base salary',
    raiseRange: 'Raise range',
    occupationInfo: 'Occupation settings can override income and contribution defaults.',
    housing: 'Housing plan',
    housingHelp: 'Buying a home reduces investable cash through down payment, closing costs, and mortgage payments.',
    housingPurchaseAge: 'Home purchase age',
    housingPriceRatio: 'Price-to-income ratio',
    housingDownPayment: 'Down payment',
    housingMortgageYears: 'Mortgage term',
    housingPrice: 'Estimated home price',
    housingUpfront: 'Down payment + closing',
    housingMonthly: 'Monthly mortgage',
    housingRate: 'Mortgage rate',
    housingNote: 'Mortgage and holding costs reduce annual investing; down payment and closing costs are deducted from the portfolio.',
    immigration: 'Immigration plan',
    immigrationHelp: 'Simulate a move later in life with a destination-specific portfolio.',
    immigrationTarget: 'Destination',
    immigrationTargetJp: 'Move to Japan',
    immigrationTargetUs: 'Move to United States',
    immigrationAge: 'Move age',
    immigrationHintJp: 'Japan routes model a relatively higher success rate than the U.S. work-visa path.',
    immigrationHintUs: 'U.S. routes model a relatively lower success rate and more forced returns.',
    immigrationAllocation: 'Post-move allocation',
    simulation: 'Simulation',
    numPaths: 'Number of paths',
    simulationView: 'Simulation view',
    storyView: 'Story view',
    runSimulation: 'Run simulation',
    simulationProgress: 'Running {value}',
    runStory: 'Generate life story',
    storyProgress: 'Generating story...',
    savePlaceholder: 'Name this saved record',
    saveConfirm: 'Save',
    saveCancel: 'Cancel',
    saveScenario: 'Save scenario',
    loadScenario: 'Saved records',
  },
  'zh-Hant': {
    region: '地區',
    lifestyle: '生活風格',
    custom: '自訂',
    finances: '財務設定',
    annualIncome: '年收入',
    annualExpense: '年開銷',
    annualContribution: '年投資',
    savingsRate: '儲蓄率',
    monthlyExpense: '月開銷',
    timeline: '時間設定',
    currentAge: '目前年齡',
    retirementAge: '退休年齡',
    endAge: '模擬終點',
    initialPortfolio: '起始資產',
    allocation: '資產配置',
    clear: '清空',
    allocationError: '配置總和不可超過 100%',
    withdrawal: '提領策略',
    withdrawalType: '策略類型',
    fixedRate: '4% 法則',
    fixedAmount: '固定金額',
    dynamic: '動態提領',
    withdrawalRate: '提領率',
    withdrawalAmount: '年提領金額',
    withdrawalFloor: '最低提領',
    withdrawalCeiling: '最高提領',
    events: '隨機事件',
    enabled: '啟用',
    disabled: '停用',
    eventsHelp: '模擬中會加入 {count} 個事件模板。',
    occupation: '職業模擬',
    occupationHelp: '職業模式會影響收入成長與職業專屬事件。',
    occupationLabel: '職業分類',
    baseSalary: '起薪',
    raiseRange: '加薪區間',
    occupationInfo: '職業設定可能覆蓋原本的收入與投資金額預設值。',
    housing: '住房規劃',
    housingHelp: '購屋會透過頭期款、交易成本與房貸支出降低可投資資金。',
    housingPurchaseAge: '購屋年齡',
    housingPriceRatio: '房價收入比',
    housingDownPayment: '頭期款比例',
    housingMortgageYears: '房貸年限',
    housingPrice: '預估房價',
    housingUpfront: '頭期款 + 交易成本',
    housingMonthly: '月付房貸',
    housingRate: '房貸利率',
    housingNote: '房貸與持有成本會降低年投資額；頭期款與交易成本會直接從資產中扣除。',
    immigration: '移民規劃',
    immigrationHelp: '模擬中後期移民，並切換到目的地的資產配置。',
    immigrationTarget: '移民目標',
    immigrationTargetJp: '移民日本',
    immigrationTargetUs: '移民美國',
    immigrationAge: '移民年齡',
    immigrationHintJp: '日本路線的成功率設計相對高於美國工作簽證路線。',
    immigrationHintUs: '美國路線的成功率相對較低，且被迫回國的機率更高。',
    immigrationAllocation: '移民後配置',
    simulation: '模擬設定',
    numPaths: '模擬路徑數',
    simulationView: '模擬結果',
    storyView: '人生故事',
    runSimulation: '執行模擬',
    simulationProgress: '模擬中 {value}',
    runStory: '生成人生故事',
    storyProgress: '故事生成中...',
    savePlaceholder: '輸入存檔名稱',
    saveConfirm: '儲存',
    saveCancel: '取消',
    saveScenario: '儲存情境',
    loadScenario: '已儲存紀錄',
  },
  ja: {
    region: '地域',
    lifestyle: 'ライフスタイル',
    custom: 'カスタム',
    finances: '財務設定',
    annualIncome: '年収',
    annualExpense: '年間支出',
    annualContribution: '年間投資',
    savingsRate: '貯蓄率',
    monthlyExpense: '月間支出',
    timeline: '時間設定',
    currentAge: '現在の年齢',
    retirementAge: '退職年齢',
    endAge: 'シミュレーション終了年齢',
    initialPortfolio: '初期資産',
    allocation: '資産配分',
    clear: 'クリア',
    allocationError: '配分合計は 100% を超えられません',
    withdrawal: '引き出し戦略',
    withdrawalType: '戦略タイプ',
    fixedRate: '4% ルール',
    fixedAmount: '固定金額',
    dynamic: '動的引き出し',
    withdrawalRate: '引き出し率',
    withdrawalAmount: '年間引き出し額',
    withdrawalFloor: '最低引き出し',
    withdrawalCeiling: '最高引き出し',
    events: 'ランダムイベント',
    enabled: '有効',
    disabled: '無効',
    eventsHelp: 'シミュレーションに {count} 件のイベントテンプレートを含めます。',
    occupation: '職業シミュレーション',
    occupationHelp: '職業モードは収入成長と職業固有イベントに影響します。',
    occupationLabel: '職業分類',
    baseSalary: '初任給',
    raiseRange: '昇給レンジ',
    occupationInfo: '職業設定により、収入と投資額の初期値が上書きされる場合があります。',
    housing: '住宅プラン',
    housingHelp: '住宅購入により頭金、諸費用、住宅ローン支払い分だけ投資可能資金が減ります。',
    housingPurchaseAge: '購入年齢',
    housingPriceRatio: '住宅価格/年収比',
    housingDownPayment: '頭金比率',
    housingMortgageYears: 'ローン年数',
    housingPrice: '想定住宅価格',
    housingUpfront: '頭金 + 諸費用',
    housingMonthly: '月次ローン支払い',
    housingRate: '住宅ローン金利',
    housingNote: 'ローンと保有コストは年間投資額を減らし、頭金と諸費用はポートフォリオから差し引かれます。',
    immigration: '移住プラン',
    immigrationHelp: '人生の途中で移住し、移住先に合わせた資産配分へ切り替えます。',
    immigrationTarget: '移住先',
    immigrationTargetJp: '日本へ移住',
    immigrationTargetUs: 'アメリカへ移住',
    immigrationAge: '移住年齢',
    immigrationHintJp: '日本ルートは米国の就労ビザルートより成功率を高めに設定しています。',
    immigrationHintUs: '米国ルートは成功率が低めで、帰国を強いられる可能性も高めです。',
    immigrationAllocation: '移住後の配分',
    simulation: 'シミュレーション設定',
    numPaths: 'パス数',
    simulationView: 'シミュレーション表示',
    storyView: '人生ストーリー',
    runSimulation: 'シミュレーション実行',
    simulationProgress: '実行中 {value}',
    runStory: '人生ストーリー生成',
    storyProgress: 'ストーリー生成中...',
    savePlaceholder: '保存名を入力',
    saveConfirm: '保存',
    saveCancel: 'キャンセル',
    saveScenario: 'シナリオ保存',
    loadScenario: '保存済みレコード',
  },
}

function translate(copy: Record<string, string>, key: string, params?: Record<string, string | number>) {
  const template = copy[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
}

export function Controls() {
  const store = useGameStore()
  const { saveRecord, records } = useSavedRecords()
  const { language } = useI18n()
  const copy = COPY[language]
  const [recordsDialogOpen, setRecordsDialogOpen] = useState(false)
  const [saveNameInput, setSaveNameInput] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const region = store.region
  const cfg = REGION_CONFIGS[region]
  const lifestyleList = isPhilippinesRegion(region)
    ? getPhilippinesLifestyleList(region)
    : region === 'jp'
      ? LIFESTYLE_LIST_JP
      : region === 'tw'
        ? LIFESTYLE_LIST_TW
        : LIFESTYLE_LIST
  const eventCount = region === 'jp' ? EVENT_DATABASE_JP.length : region === 'tw' ? EVENT_DATABASE_TW.length : EVENT_DATABASE.length
  const occupationSupported = !isPhilippinesRegion(region)
  const r = cfg.sliderRanges

  const handleAllocationChange = (key: keyof Allocation, value: number) => {
    const next = { ...store.allocation, [key]: value / 100 }
    const sum = ASSET_KEYS.reduce((s, k) => s + next[k], 0)
    if (sum > 1.001) return
    store.setAllocation(next)
  }

  const handleImmAllocationChange = (key: keyof Allocation, value: number) => {
    const next = { ...store.immigrationAllocation, [key]: value / 100 }
    const sum = ASSET_KEYS.reduce((s, k) => s + next[k], 0)
    if (sum > 1.001) return
    store.setImmigrationAllocation(next)
  }

  const immAllocSum = ASSET_KEYS.reduce((s, k) => s + store.immigrationAllocation[k], 0)
  const immAllocValid = Math.abs(immAllocSum - 1) <= 0.001
  const allocSum = ASSET_KEYS.reduce((s, k) => s + store.allocation[k], 0)
  const allocValid = Math.abs(allocSum - 1) <= 0.001
  const savingsRate = store.annualIncome > 0 ? store.annualContribution / store.annualIncome : 0
  const fmtVal = (v: number) => formatSliderValue(v, region, language)
  const fmtMonthly = (v: number) => formatSliderValue(Math.round(v / 12), region, language)
  const selectedOcc = occupationSupported ? OCCUPATION_MAP.get(store.occupationId) ?? null : null

  const persistScenario = () => {
    if (!saveNameInput.trim()) return
    saveRecord({
      name: saveNameInput.trim(),
      region: store.region,
      lifestyleId: store.lifestyleId,
      annualIncome: store.annualIncome,
      annualExpense: store.annualExpense,
      currentAge: store.currentAge,
      retirementAge: store.retirementAge,
      endAge: store.endAge,
      initialPortfolio: store.initialPortfolio,
      annualContribution: store.annualContribution,
      allocation: { ...store.allocation },
      withdrawal: store.withdrawal,
      numPaths: store.numPaths,
      enableEvents: store.enableEvents,
      immigrationEnabled: store.immigrationEnabled,
      immigrationTarget: store.immigrationTarget,
      immigrationAge: store.immigrationAge,
      immigrationAllocation: { ...store.immigrationAllocation },
      occupationEnabled: store.occupationEnabled,
      occupationId: store.occupationId,
      housingEnabled: store.housingEnabled,
      housingPurchaseAge: store.housingPurchaseAge,
      housingPriceToIncomeRatio: store.housingPriceToIncomeRatio,
      housingDownPaymentRatio: store.housingDownPaymentRatio,
      housingMortgageYears: store.housingMortgageYears,
      resultSummary: store.result ? {
        successRate: store.result.successRate,
        medianFinalPortfolio: store.result.medianFinalPortfolio,
      } : undefined,
    })
    setSaveNameInput('')
    setShowSaveInput(false)
  }

  const hp = HOUSING_PARAMS[region]
  const effectiveRegion = store.immigrationEnabled && store.immigrationTarget ? store.immigrationTarget : region
  const effectiveHousing = HOUSING_PARAMS[effectiveRegion]
  const estimatedPrice = store.annualIncome * store.housingPriceToIncomeRatio
  const downPayment = estimatedPrice * store.housingDownPaymentRatio
  const loanAmount = estimatedPrice - downPayment
  const closingCost = estimatedPrice * effectiveHousing.closingCostRatio
  const monthlyRate = effectiveHousing.mortgageRate / 12
  const totalMonths = store.housingMortgageYears * 12
  const monthlyPayment = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : loanAmount / totalMonths

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.region}
      </Typography>
      <ToggleButtonGroup
        fullWidth
        size="small"
        exclusive
        value={region}
        onChange={(_, v) => v && store.setRegion(v as Region)}
        sx={{ mb: 0.5 }}
      >
        <ToggleButton value="us">{getRegionLabel('us', language)} USD</ToggleButton>
        <ToggleButton value="tw">{getRegionLabel('tw', language)} TWD</ToggleButton>
        <ToggleButton value="jp">{getRegionLabel('jp', language)} JPY</ToggleButton>
        <ToggleButton value="ph-manila">{getRegionLabel('ph-manila', language)} PHP</ToggleButton>
        <ToggleButton value="ph-cebu">{getRegionLabel('ph-cebu', language)} PHP</ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.lifestyle}
      </Typography>
      <Grid container spacing={1}>
        {lifestyleList.map((preset) => (
          <Grid size={6} key={preset.id}>
            <Card
              variant={store.lifestyleId === preset.id ? 'elevation' : 'outlined'}
              elevation={store.lifestyleId === preset.id ? 4 : 0}
              sx={{
                border: store.lifestyleId === preset.id ? '2px solid' : '1px solid',
                borderColor: store.lifestyleId === preset.id ? 'primary.main' : 'divider',
                transition: 'all 0.15s',
              }}
            >
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
          {lifestyleList.find((p) => p.id === store.lifestyleId)?.description}
        </Typography>
      )}
      {store.lifestyleId === 'custom' && (
        <Chip size="small" label={copy.custom} color="default" variant="outlined" />
      )}

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.finances}
      </Typography>
      <SliderField label={copy.annualIncome} value={store.annualIncome} unit=""
        min={r.annualIncome.min} max={r.annualIncome.max} step={r.annualIncome.step}
        onChange={store.setAnnualIncome} format={fmtVal} />
      <SliderField label={copy.annualExpense} value={store.annualExpense} unit=""
        min={r.annualExpense.min} max={r.annualExpense.max} step={r.annualExpense.step}
        onChange={store.setAnnualExpense} format={fmtVal} />
      <SliderField label={copy.annualContribution} value={store.annualContribution} unit=""
        min={r.annualContribution.min} max={r.annualContribution.max} step={r.annualContribution.step}
        onChange={store.setAnnualContribution} format={fmtVal} />

      <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
        <Chip
          size="small"
          variant="outlined"
          color={savingsRate >= 0.3 ? 'success' : savingsRate >= 0.15 ? 'warning' : 'error'}
          label={`${copy.savingsRate} ${(savingsRate * 100).toFixed(0)}%`}
        />
        <Chip size="small" variant="outlined" label={`${copy.monthlyExpense} ${fmtMonthly(store.annualExpense)}`} />
      </Stack>

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.timeline}
      </Typography>
      <SliderField label={copy.currentAge} value={store.currentAge} unit=""
        min={20} max={60} onChange={store.setCurrentAge} />
      <SliderField label={copy.retirementAge} value={store.retirementAge} unit=""
        min={store.currentAge + 1} max={80} onChange={store.setRetirementAge} />
      <SliderField label={copy.endAge} value={store.endAge} unit=""
        min={store.retirementAge + 1} max={100} onChange={store.setEndAge} />
      <SliderField label={copy.initialPortfolio} value={store.initialPortfolio} unit=""
        min={r.initialPortfolio.min} max={r.initialPortfolio.max} step={r.initialPortfolio.step}
        onChange={store.setInitialPortfolio} format={fmtVal} />

      <Divider sx={{ my: 1 }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          {copy.allocation}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Chip size="small" label={copy.clear} variant="outlined" clickable onClick={() => store.setAllocation({ ...ZERO_ALLOCATION })} />
          <Chip size="small" label={`${(allocSum * 100).toFixed(0)}%`} color={allocValid ? 'success' : 'error'} variant="outlined" />
        </Stack>
      </Stack>
      {ASSET_KEYS.map((key) => (
        <Box key={key}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: ASSET_COLORS[key], fontWeight: 600 }}>
              {getAssetLabel(region, key, language)}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {(store.allocation[key] * 100).toFixed(0)}%
            </Typography>
          </Stack>
          <Slider
            size="small"
            min={0}
            max={100}
            step={5}
            value={store.allocation[key] * 100}
            onChange={(_, v) => handleAllocationChange(key, v as number)}
            sx={{ color: ASSET_COLORS[key], py: 0.5 }}
          />
        </Box>
      ))}
      {!allocValid && (
        <Alert severity="error" variant="outlined" sx={{ py: 0 }}>
          {copy.allocationError}
        </Alert>
      )}

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.withdrawal}
      </Typography>
      <FormControl size="small" fullWidth>
        <InputLabel>{copy.withdrawalType}</InputLabel>
        <Select
          label={copy.withdrawalType}
          value={store.withdrawal.type}
          onChange={(e) => {
            const type = e.target.value
            if (type === 'fixed_rate') store.setWithdrawal({ type: 'fixed_rate', rate: 0.04 })
            else if (type === 'fixed_amount') store.setWithdrawal({ type: 'fixed_amount', amount: store.annualExpense })
            else store.setWithdrawal({ type: 'dynamic', floor: store.annualExpense * 0.7, ceiling: store.annualExpense * 1.5 })
          }}
        >
          <MenuItem value="fixed_rate">{copy.fixedRate}</MenuItem>
          <MenuItem value="fixed_amount">{copy.fixedAmount}</MenuItem>
          <MenuItem value="dynamic">{copy.dynamic}</MenuItem>
        </Select>
      </FormControl>
      {store.withdrawal.type === 'fixed_rate' && (
        <SliderField label={copy.withdrawalRate} value={store.withdrawal.rate * 100} unit="%"
          min={2} max={8} step={0.5}
          onChange={(v) => store.setWithdrawal({ type: 'fixed_rate', rate: v / 100 })}
          format={(v) => `${v.toFixed(1)}%`} />
      )}
      {store.withdrawal.type === 'fixed_amount' && (
        <SliderField label={copy.withdrawalAmount} value={store.withdrawal.amount} unit=""
          min={r.withdrawalAmount.min} max={r.withdrawalAmount.max} step={r.withdrawalAmount.step}
          onChange={(v) => store.setWithdrawal({ type: 'fixed_amount', amount: v })}
          format={fmtVal} />
      )}
      {store.withdrawal.type === 'dynamic' && (
        <>
          <SliderField label={copy.withdrawalFloor} value={store.withdrawal.floor} unit=""
            min={r.withdrawalFloor.min} max={r.withdrawalFloor.max} step={r.withdrawalFloor.step}
            onChange={(v) => store.setWithdrawal({
              type: 'dynamic',
              floor: v,
              ceiling: store.withdrawal.type === 'dynamic' ? store.withdrawal.ceiling : v * 2,
            })}
            format={fmtVal} />
          <SliderField label={copy.withdrawalCeiling} value={store.withdrawal.ceiling} unit=""
            min={r.withdrawalCeiling.min} max={r.withdrawalCeiling.max} step={r.withdrawalCeiling.step}
            onChange={(v) => store.setWithdrawal({
              type: 'dynamic',
              floor: store.withdrawal.type === 'dynamic' ? store.withdrawal.floor : v / 2,
              ceiling: v,
            })}
            format={fmtVal} />
        </>
      )}

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.events}
      </Typography>
      <FormControlLabel
        control={<Switch checked={store.enableEvents} onChange={(_, v) => store.setEnableEvents(v)} color="warning" />}
        label={(
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {store.enableEvents ? copy.enabled : copy.disabled}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {translate(copy, 'eventsHelp', { count: eventCount })}
            </Typography>
          </Stack>
        )}
      />

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.occupation}
      </Typography>
      <FormControlLabel
        control={<Switch checked={occupationSupported && store.occupationEnabled} disabled={!occupationSupported} onChange={(_, v) => store.setOccupationEnabled(v)} color="info" />}
        label={(
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {store.occupationEnabled ? copy.enabled : copy.disabled}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {copy.occupationHelp}
            </Typography>
          </Stack>
        )}
      />
      {occupationSupported && store.occupationEnabled && selectedOcc && (
        <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{copy.occupationLabel}</InputLabel>
            <Select value={store.occupationId} label={copy.occupationLabel} onChange={(e) => store.setOccupationId(Number(e.target.value))}>
              {OCCUPATIONS.map((occ) => (
                <MenuItem key={occ.id} value={occ.id}>
                  {occ.emoji} {occ.name[region]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {selectedOcc.description[region]}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {copy.baseSalary}: {formatCurrency(selectedOcc.baseSalary[region], region, language)}
          </Typography>
          <Typography variant="body2">
            {copy.raiseRange}: {(selectedOcc.raiseRange[region][0] * 100).toFixed(1)}% ~ {(selectedOcc.raiseRange[region][1] * 100).toFixed(1)}%
          </Typography>

          <Alert severity="info" sx={{ mt: 1 }}>
            {copy.occupationInfo}
          </Alert>
        </Paper>
      )}

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.housing}
      </Typography>
      <FormControlLabel
        control={<Switch checked={store.housingEnabled} onChange={(_, v) => store.setHousingEnabled(v)} color="success" />}
        label={(
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {store.housingEnabled ? copy.enabled : copy.disabled}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {copy.housingHelp}
            </Typography>
          </Stack>
        )}
      />
      {store.housingEnabled && (
        <>
          <SliderField label={copy.housingPurchaseAge} value={store.housingPurchaseAge} unit=""
            min={store.currentAge} max={store.retirementAge}
            onChange={store.setHousingPurchaseAge} />
          <SliderField label={copy.housingPriceRatio} value={store.housingPriceToIncomeRatio} unit="x"
            min={hp.priceToIncomeRange.min} max={hp.priceToIncomeRange.max} step={hp.priceToIncomeRange.step}
            onChange={store.setHousingPriceToIncomeRatio}
            format={(v) => `${v}x`} />
          <SliderField label={copy.housingDownPayment} value={store.housingDownPaymentRatio * 100} unit="%"
            min={10} max={50} step={5}
            onChange={(v) => store.setHousingDownPaymentRatio(v / 100)}
            format={(v) => `${v.toFixed(0)}%`} />

          <FormControl size="small" fullWidth>
            <InputLabel>{copy.housingMortgageYears}</InputLabel>
            <Select label={copy.housingMortgageYears} value={store.housingMortgageYears} onChange={(e) => store.setHousingMortgageYears(e.target.value as number)}>
              {hp.mortgageYearsOptions.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'action.hover' }}>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{copy.housingPrice}</Typography>
                <Typography variant="caption" fontWeight={700}>{formatCurrency(estimatedPrice, region, language)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{copy.housingUpfront}</Typography>
                <Typography variant="caption" fontWeight={700}>{formatCurrency(downPayment + closingCost, region, language)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{copy.housingMonthly}</Typography>
                <Typography variant="caption" fontWeight={700} color="warning.main">{formatCurrency(Math.round(monthlyPayment), region, language)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{copy.housingRate}</Typography>
                <Typography variant="caption" fontWeight={700}>{(effectiveHousing.mortgageRate * 100).toFixed(1)}%</Typography>
              </Stack>
            </Stack>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
            {copy.housingNote}
          </Typography>
        </>
      )}

      {region === 'tw' && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            {copy.immigration}
          </Typography>
          <FormControlLabel
            control={<Switch checked={store.immigrationEnabled} onChange={(_, v) => store.setImmigrationEnabled(v)} color="info" />}
            label={(
              <Stack>
                <Typography variant="body2" fontWeight={600}>
                  {store.immigrationEnabled ? copy.enabled : copy.disabled}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {copy.immigrationHelp}
                </Typography>
              </Stack>
            )}
          />
          {store.immigrationEnabled && (
            <>
              <ToggleButtonGroup
                fullWidth
                size="small"
                exclusive
                value={store.immigrationTarget}
                onChange={(_, v) => v && store.setImmigrationTarget(v)}
                sx={{ mb: 0.5 }}
              >
                <ToggleButton value="jp">{copy.immigrationTargetJp}</ToggleButton>
                <ToggleButton value="us">{copy.immigrationTargetUs}</ToggleButton>
              </ToggleButtonGroup>
              {store.immigrationTarget && (
                <>
                  <SliderField label={copy.immigrationAge} value={store.immigrationAge} unit=""
                    min={store.currentAge + 1} max={store.retirementAge - 5}
                    onChange={store.setImmigrationAge} />
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {store.immigrationTarget === 'jp' ? copy.immigrationHintJp : copy.immigrationHintUs}
                  </Typography>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {copy.immigrationAllocation}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Chip size="small" label={copy.clear} variant="outlined" clickable onClick={() => store.setImmigrationAllocation({ ...ZERO_ALLOCATION })} />
                      <Chip size="small" label={`${(immAllocSum * 100).toFixed(0)}%`} color={immAllocValid ? 'success' : 'error'} variant="outlined" />
                    </Stack>
                  </Stack>

                  {ASSET_KEYS.map((key) => {
                    const targetCfg = REGION_CONFIGS[store.immigrationTarget!]
                    return (
                      <Box key={`imm-${key}`}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: ASSET_COLORS[key], fontWeight: 600 }}>
                            {getAssetLabel(targetCfg.id, key, language)}
                          </Typography>
                          <Typography variant="caption" fontWeight={700}>
                            {(store.immigrationAllocation[key] * 100).toFixed(0)}%
                          </Typography>
                        </Stack>
                        <Slider
                          size="small"
                          min={0}
                          max={100}
                          step={5}
                          value={store.immigrationAllocation[key] * 100}
                          onChange={(_, v) => handleImmAllocationChange(key, v as number)}
                          sx={{ color: ASSET_COLORS[key], py: 0.3 }}
                        />
                      </Box>
                    )
                  })}

                  {!immAllocValid && (
                    <Alert severity="error" variant="outlined" sx={{ py: 0 }}>
                      {copy.allocationError}
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      <Divider sx={{ my: 1 }} />

      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {copy.simulation}
      </Typography>
      <SliderField label={copy.numPaths} value={store.numPaths} unit=""
        min={1000} max={50000} step={1000} onChange={store.setNumPaths}
        format={(v) => v.toLocaleString(language === 'ja' ? 'ja-JP' : language === 'zh-Hant' ? 'zh-TW' : 'en-US')} />

      <ToggleButtonGroup fullWidth size="small" exclusive value={store.viewMode} onChange={(_, v) => v && store.setViewMode(v)} sx={{ mb: 1 }}>
        <ToggleButton value="simulation">
          <BarChartIcon sx={{ mr: 0.5, fontSize: 18 }} /> {copy.simulationView}
        </ToggleButton>
        <ToggleButton value="story">
          <AutoStoriesIcon sx={{ mr: 0.5, fontSize: 18 }} /> {copy.storyView}
        </ToggleButton>
      </ToggleButtonGroup>

      {store.isRunning && (
        <LinearProgress variant="determinate" value={store.progress * 100} sx={{ borderRadius: 1 }} />
      )}

      {store.viewMode === 'simulation' ? (
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={store.isRunning || !allocValid || (store.immigrationEnabled && !!store.immigrationTarget && !immAllocValid)}
          onClick={store.runSimulation}
          startIcon={store.isRunning ? <HourglassTopIcon /> : <PlayArrowIcon />}
          sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16 }}
        >
          {store.isRunning ? translate(copy, 'simulationProgress', { value: `${(store.progress * 100).toFixed(0)}%` }) : copy.runSimulation}
        </Button>
      ) : (
        <Button
          variant="contained"
          size="large"
          fullWidth
          color="secondary"
          disabled={store.isStoryRunning || !allocValid || (store.immigrationEnabled && !!store.immigrationTarget && !immAllocValid)}
          onClick={store.runStory}
          startIcon={<AutoStoriesIcon />}
          sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16 }}
        >
          {store.isStoryRunning ? copy.storyProgress : copy.runStory}
        </Button>
      )}

      <Divider sx={{ my: 1 }} />

      {showSaveInput ? (
        <Stack spacing={1}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder={copy.savePlaceholder}
            value={saveNameInput}
            onChange={(e) => setSaveNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && saveNameInput.trim()) persistScenario()
              if (e.key === 'Escape') {
                setSaveNameInput('')
                setShowSaveInput(false)
              }
            }}
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" fullWidth disabled={!saveNameInput.trim()} onClick={persistScenario}>
              {copy.saveConfirm}
            </Button>
            <Button size="small" variant="outlined" fullWidth onClick={() => { setSaveNameInput(''); setShowSaveInput(false) }}>
              {copy.saveCancel}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" fullWidth startIcon={<SaveIcon />} onClick={() => setShowSaveInput(true)} sx={{ fontWeight: 600 }}>
            {copy.saveScenario}
          </Button>
          <Button variant="outlined" fullWidth startIcon={<FolderOpenIcon />} onClick={() => setRecordsDialogOpen(true)} sx={{ fontWeight: 600 }}>
            {copy.loadScenario}{records.length > 0 ? ` (${records.length})` : ''}
          </Button>
        </Stack>
      )}

      <SavedRecordsDialog open={recordsDialogOpen} onClose={() => setRecordsDialogOpen(false)} />
    </Box>
  )
}

function SliderField({ label, value, unit, min, max, step = 1, onChange, format }: {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const display = format ? format(value) : `${value} ${unit}`.trim()

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commitEdit = () => {
    setEditing(false)
    const parsed = parseFloat(editValue.replace(/[^0-9.\-]/g, ''))
    if (isNaN(parsed)) return
    const clamped = Math.min(max, Math.max(min, parsed))
    const snapped = Math.round(clamped / step) * step
    onChange(snapped)
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        {editing ? (
          <TextField
            inputRef={inputRef}
            size="small"
            variant="standard"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            slotProps={{
              input: {
                endAdornment: unit ? <InputAdornment position="end"><Typography variant="caption">{unit}</Typography></InputAdornment> : undefined,
                sx: { fontSize: '0.875rem', fontWeight: 700 },
              },
              htmlInput: { inputMode: 'decimal' },
            }}
            sx={{ width: 110, '& .MuiInput-underline:before': { borderBottom: '2px solid', borderColor: 'primary.main' } }}
          />
        ) : (
          <Typography
            variant="body2"
            fontWeight={700}
            onClick={() => { setEditValue(String(value)); setEditing(true) }}
            sx={{
              cursor: 'pointer',
              px: 0.5,
              borderRadius: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
              borderBottom: '1px dashed',
              borderColor: 'text.disabled',
            }}
          >
            {display}
          </Typography>
        )}
      </Stack>
      <Slider size="small" min={min} max={max} step={step} value={value} onChange={(_, v) => onChange(v as number)} sx={{ py: 0.5 }} />
    </Box>
  )
}
