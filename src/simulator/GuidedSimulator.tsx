import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Box,
  Button,
  LinearProgress,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BarChartIcon from '@mui/icons-material/BarChart'
import type { Allocation, WithdrawalStrategy } from '../engine/simulator'
import { REGION_CONFIGS, formatCurrency, formatSliderValue, getRegionLabel, type Region } from '../config/regions'
import { LIFESTYLE_LIST, type LifestyleId } from '../engine/lifestyle'
import { LIFESTYLE_LIST_TW } from '../engine/lifestyle_tw'
import { LIFESTYLE_LIST_JP } from '../engine/lifestyle_jp'
import { getPhilippinesLifestyleList } from '../engine/lifestyle_ph'
import { getLifestyleDisplay } from '../i18n/lifestyles'
import { useI18n } from '../i18n'
import type { UiLanguage } from '../i18n/types'
import { useGameStore } from '../store/gameStore'
import { ResultPanel } from '../components/ResultPanel'
import './GuidedSimulator.css'

type GuidedStep = 'basics' | 'money' | 'retirement' | 'risk' | 'review' | 'results'
type RiskPreset = 'conservative' | 'balanced' | 'growth'

const STEP_IDS: GuidedStep[] = ['basics', 'money', 'retirement', 'risk', 'review', 'results']

interface GuidedCopy {
  steps: Record<GuidedStep, string>
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  advanced: string
  back: string
  next: string
  run: string
  runAgain: string
  enabled: string
  disabled: string
  blocked: string
  custom: string
  on: string
  off: string
  noRunTitle: string
  noRunBody: string
  verdict: {
    strongTitle: string
    strongBody: string
    borderlineTitle: string
    borderlineBody: string
    fragileTitle: string
    fragileBody: string
  }
  stepContent: Record<GuidedStep, { kicker: string; title: string; lead: string }>
  labels: Record<string, string>
  risk: Record<RiskPreset, { title: string; body: string }>
  withdrawal: Record<string, string>
  warnings: {
    retirementAge: string
    endAge: string
    spending: string
    allocation: string
  }
}

const GUIDED_COPY: Record<UiLanguage, GuidedCopy> = {
  en: {
    steps: { basics: 'Basics', money: 'Money', retirement: 'Plan', risk: 'Risk', review: 'Review', results: 'Results' },
    heroEyebrow: 'Guided simulator',
    heroTitle: 'Build the plan one decision at a time.',
    heroBody: 'Answer the few inputs that matter most first. Advanced assumptions stay available, but they no longer have to be the first thing you see.',
    advanced: 'Advanced settings',
    back: 'Back',
    next: 'Next',
    run: 'Run simulation',
    runAgain: 'Run again',
    enabled: 'Enabled',
    disabled: 'Disabled',
    blocked: 'In development',
    custom: 'Custom',
    on: 'On',
    off: 'Off',
    noRunTitle: 'No run yet',
    noRunBody: 'Review your assumptions, then run the simulation to see the survival rate and detailed charts.',
    verdict: {
      strongTitle: 'Strong plan',
      strongBody: 'Most simulated futures survive. You can use the quick refinements below to test how much flexibility you have.',
      borderlineTitle: 'Borderline plan',
      borderlineBody: 'The plan works in many futures, but not enough to ignore risk. Try retiring later, spending less, or investing more.',
      fragileTitle: 'Fragile plan',
      fragileBody: 'Too many simulated futures run out of money. Start by reducing spending, increasing annual invest, or delaying retirement.',
    },
    stepContent: {
      basics: { kicker: 'Step 1', title: 'Start with the basics', lead: 'Confirm the region, age timeline, and lifestyle preset before looking at investment details.' },
      money: { kicker: 'Step 2', title: 'Put the money in plain view', lead: 'This step shows whether the rough 4% target is already close or still far away.' },
      retirement: { kicker: 'Step 3', title: 'Decide how retirement spending works', lead: 'The simplest model spends your expected annual spending after retirement. You can still use advanced withdrawal rules later.' },
      risk: { kicker: 'Step 4', title: 'Choose a risk posture', lead: 'Pick a plain-language risk preset now. Custom asset sliders are still available in advanced settings.' },
      review: { kicker: 'Step 5', title: 'Review before running', lead: 'This is the complete first version of your plan. Run it now, then refine after seeing the survival rate.' },
      results: { kicker: 'Step 6', title: 'Read the result, then refine', lead: 'The first run gives you a survival rate. Use the quick controls below to test the most important levers.' },
    },
    labels: {
      region: 'Region',
      lifestyle: 'Lifestyle',
      currentAge: 'Current age',
      retirementAge: 'Retirement age',
      yearsToRetirement: 'Years to retirement',
      scenario: 'Scenario',
      currency: 'Currency',
      endAge: 'End age',
      annualIncome: 'Annual income',
      annualSpending: 'Annual spending',
      annualInvest: 'Annual invest',
      portfolioToday: 'Portfolio today',
      monthlySpending: 'Monthly spending',
      savingsRate: 'Savings rate',
      fourPercentTarget: '4% target',
      gapToTarget: 'Gap to target',
      withdrawalStrategy: 'Withdrawal strategy',
      annualWithdrawal: 'Annual withdrawal',
      planUntilAge: 'Plan until age',
      retirementYears: 'Retirement years',
      firstYearSpend: 'First-year spend',
      ruleOfThumb: 'Rule of thumb',
      randomEvents: 'Random events',
      housingPlan: 'Housing plan',
      occupationSimulation: 'Occupation simulation',
      stockWeight: 'Stock weight',
      bondWeight: 'Bond weight',
      goldWeight: 'Gold weight',
      cashWeight: 'Cash weight',
      allocationTotal: 'Allocation total',
      timeline: 'Timeline',
      incomeSpending: 'Income / spending',
      riskPreset: 'Risk preset',
      paths: 'Paths',
      events: 'Events',
      withdrawal: 'Withdrawal',
    },
    risk: {
      conservative: { title: 'Conservative', body: 'Lower stock exposure, more bonds and cash.' },
      balanced: { title: 'Balanced', body: 'A mixed allocation for growth and stability.' },
      growth: { title: 'Growth', body: 'Higher stock exposure and larger swings.' },
    },
    withdrawal: { fixed_amount: 'Fixed amount', fixed_rate: '4% rule', dynamic: 'Dynamic spending' },
    warnings: {
      retirementAge: 'Retirement age must be after current age.',
      endAge: 'Plan end age must be after retirement age.',
      spending: 'Annual spending is higher than annual income.',
      allocation: 'Allocation must total 100%.',
    },
  },
  'zh-Hant': {
    steps: { basics: '基本資料', money: '金錢', retirement: '退休計畫', risk: '風險', review: '確認', results: '結果' },
    heroEyebrow: '引導式模擬器',
    heroTitle: '一步一步建立你的退休計畫。',
    heroBody: '先回答最重要的幾個問題。進階假設仍然保留，但不再一開始就全部丟給你。',
    advanced: '進階設定',
    back: '上一步',
    next: '下一步',
    run: '開始模擬',
    runAgain: '重新模擬',
    enabled: '已啟用',
    disabled: '未啟用',
    blocked: '還在開發中',
    custom: '自訂',
    on: '開',
    off: '關',
    noRunTitle: '尚未模擬',
    noRunBody: '先確認假設，再開始模擬，就能看到存活率與詳細圖表。',
    verdict: {
      strongTitle: '計畫穩健',
      strongBody: '大多數模擬未來都能撐過。你可以用下方快速調整測試還有多少彈性。',
      borderlineTitle: '計畫接近臨界',
      borderlineBody: '這個計畫在不少未來可行，但風險仍高。試著晚點退休、少花一點、或增加每年投入。',
      fragileTitle: '計畫脆弱',
      fragileBody: '太多模擬未來會提早耗盡資產。先從降低支出、增加投入、或延後退休開始調整。',
    },
    stepContent: {
      basics: { kicker: '第 1 步', title: '先確認基本資料', lead: '先確認地區、年齡時間線與生活型態，再進入投資細節。' },
      money: { kicker: '第 2 步', title: '把金錢狀況攤開', lead: '這一步會看出你離 4% 法則的粗略目標已經很近，還是仍有差距。' },
      retirement: { kicker: '第 3 步', title: '決定退休後怎麼花錢', lead: '最簡單的模型會把目前預期年支出當成退休後提領額。進階提領規則之後仍可調整。' },
      risk: { kicker: '第 4 步', title: '選擇風險姿態', lead: '先用白話選擇風險預設。完整資產配置滑桿仍在進階設定中。' },
      review: { kicker: '第 5 步', title: '模擬前再確認一次', lead: '這是你的第一版完整計畫。先跑一次，再根據存活率微調。' },
      results: { kicker: '第 6 步', title: '閱讀結果，然後調整', lead: '第一次模擬會給你存活率。用下方快速控制調整最重要的槓桿。' },
    },
    labels: {
      region: '地區',
      lifestyle: '生活型態',
      currentAge: '目前年齡',
      retirementAge: '退休年齡',
      yearsToRetirement: '距離退休年數',
      scenario: '情境',
      currency: '幣別',
      endAge: '結束年齡',
      annualIncome: '年收入',
      annualSpending: '年支出',
      annualInvest: '每年投入',
      portfolioToday: '目前資產',
      monthlySpending: '月支出',
      savingsRate: '儲蓄率',
      fourPercentTarget: '4% 目標',
      gapToTarget: '目標差距',
      withdrawalStrategy: '提領策略',
      annualWithdrawal: '每年提領',
      planUntilAge: '計畫到幾歲',
      retirementYears: '退休年數',
      firstYearSpend: '第一年支出',
      ruleOfThumb: '粗略目標',
      randomEvents: '隨機事件',
      housingPlan: '買房計畫',
      occupationSimulation: '職涯模擬',
      stockWeight: '股票比例',
      bondWeight: '債券比例',
      goldWeight: '黃金比例',
      cashWeight: '現金比例',
      allocationTotal: '配置總和',
      timeline: '時間線',
      incomeSpending: '收入 / 支出',
      riskPreset: '風險預設',
      paths: '模擬路徑',
      events: '事件',
      withdrawal: '提領',
    },
    risk: {
      conservative: { title: '保守', body: '股票比例較低，債券與現金較高。' },
      balanced: { title: '平衡', body: '兼顧成長與穩定的混合配置。' },
      growth: { title: '成長', body: '股票比例較高，波動也較大。' },
    },
    withdrawal: { fixed_amount: '固定金額', fixed_rate: '4% 法則', dynamic: '動態支出' },
    warnings: {
      retirementAge: '退休年齡必須晚於目前年齡。',
      endAge: '計畫結束年齡必須晚於退休年齡。',
      spending: '年支出高於年收入。',
      allocation: '資產配置總和必須是 100%。',
    },
  },
  ja: {
    steps: { basics: '基本', money: 'お金', retirement: '計画', risk: 'リスク', review: '確認', results: '結果' },
    heroEyebrow: 'ガイド式シミュレーター',
    heroTitle: '一つずつ退職計画を作る。',
    heroBody: 'まず重要な入力だけに集中します。詳細設定は残しつつ、最初から全部を見せないようにします。',
    advanced: '詳細設定',
    back: '戻る',
    next: '次へ',
    run: 'シミュレーション開始',
    runAgain: '再実行',
    enabled: '有効',
    disabled: '無効',
    blocked: '開発中です',
    custom: 'カスタム',
    on: 'オン',
    off: 'オフ',
    noRunTitle: 'まだ実行していません',
    noRunBody: '前提を確認してから実行すると、生存率と詳細チャートが表示されます。',
    verdict: {
      strongTitle: '強い計画',
      strongBody: '多くのシミュレーションで資産が持続します。下の調整で余裕度を確認できます。',
      borderlineTitle: '境界線の計画',
      borderlineBody: '多くのケースで成立しますが、まだリスクがあります。退職を遅らせる、支出を下げる、投資額を増やすことを試してください。',
      fragileTitle: '弱い計画',
      fragileBody: '多くのシミュレーションで資産が尽きます。まず支出を下げる、投資額を増やす、退職を遅らせる調整から始めてください。',
    },
    stepContent: {
      basics: { kicker: 'Step 1', title: '基本から始める', lead: '地域、年齢の流れ、生活プリセットを確認してから投資の詳細に進みます。' },
      money: { kicker: 'Step 2', title: 'お金を見える化する', lead: '4%ルールの目安に近いのか、まだ差があるのかを確認します。' },
      retirement: { kicker: 'Step 3', title: '退職後の支出を決める', lead: '最も単純なモデルでは、現在想定している年間支出を退職後の引き出し額にします。詳細な引き出しルールは後で調整できます。' },
      risk: { kicker: 'Step 4', title: 'リスク姿勢を選ぶ', lead: 'まず分かりやすいリスク設定を選びます。細かい資産配分は詳細設定で変更できます。' },
      review: { kicker: 'Step 5', title: '実行前に確認', lead: 'これが最初の計画です。まず実行し、生存率を見てから調整します。' },
      results: { kicker: 'Step 6', title: '結果を読み、調整する', lead: '最初の実行で生存率が分かります。下のクイック操作で重要な前提を試せます。' },
    },
    labels: {
      region: '地域',
      lifestyle: '生活',
      currentAge: '現在の年齢',
      retirementAge: '退職年齢',
      yearsToRetirement: '退職までの年数',
      scenario: 'シナリオ',
      currency: '通貨',
      endAge: '終了年齢',
      annualIncome: '年収',
      annualSpending: '年間支出',
      annualInvest: '年間投資',
      portfolioToday: '現在の資産',
      monthlySpending: '月間支出',
      savingsRate: '貯蓄率',
      fourPercentTarget: '4%目標',
      gapToTarget: '目標との差',
      withdrawalStrategy: '引き出し戦略',
      annualWithdrawal: '年間引き出し',
      planUntilAge: '何歳まで計画',
      retirementYears: '退職期間',
      firstYearSpend: '初年度支出',
      ruleOfThumb: '目安',
      randomEvents: 'ランダムイベント',
      housingPlan: '住宅計画',
      occupationSimulation: '職業シミュレーション',
      stockWeight: '株式比率',
      bondWeight: '債券比率',
      goldWeight: '金比率',
      cashWeight: '現金比率',
      allocationTotal: '配分合計',
      timeline: 'タイムライン',
      incomeSpending: '収入 / 支出',
      riskPreset: 'リスク設定',
      paths: 'パス数',
      events: 'イベント',
      withdrawal: '引き出し',
    },
    risk: {
      conservative: { title: '保守的', body: '株式比率を下げ、債券と現金を多めにします。' },
      balanced: { title: 'バランス', body: '成長と安定を組み合わせた配分です。' },
      growth: { title: '成長重視', body: '株式比率を高め、変動も大きくなります。' },
    },
    withdrawal: { fixed_amount: '固定金額', fixed_rate: '4%ルール', dynamic: '動的支出' },
    warnings: {
      retirementAge: '退職年齢は現在の年齢より後にしてください。',
      endAge: '終了年齢は退職年齢より後にしてください。',
      spending: '年間支出が年収を上回っています。',
      allocation: '資産配分の合計は100%にしてください。',
    },
  },
}

const REGION_OPTIONS: Region[] = ['us', 'tw', 'jp', 'ph-manila', 'ph-cebu']

const RISK_ALLOCATIONS: Record<RiskPreset, Allocation> = {
  conservative: { sp500: 0.25, intlStock: 0.10, bond: 0.40, gold: 0.10, cash: 0.15, reits: 0 },
  balanced: { sp500: 0.45, intlStock: 0.15, bond: 0.20, gold: 0.10, cash: 0.10, reits: 0 },
  growth: { sp500: 0.60, intlStock: 0.20, bond: 0.10, gold: 0.05, cash: 0.05, reits: 0 },
}

function getLifestyleList(region: Region) {
  if (region === 'tw') return LIFESTYLE_LIST_TW
  if (region === 'jp') return LIFESTYLE_LIST_JP
  if (region === 'ph-manila' || region === 'ph-cebu') return getPhilippinesLifestyleList(region)
  return LIFESTYLE_LIST
}

function allocationSum(allocation: Allocation) {
  return Object.values(allocation).reduce((sum, value) => sum + value, 0)
}

function getRiskPreset(allocation: Allocation): RiskPreset {
  const stock = allocation.sp500 + allocation.intlStock
  if (stock < 0.5) return 'conservative'
  if (stock > 0.72) return 'growth'
  return 'balanced'
}

function getWithdrawalAmount(withdrawal: WithdrawalStrategy, fallback: number) {
  if (withdrawal.type === 'fixed_amount') return withdrawal.amount
  if (withdrawal.type === 'dynamic') return withdrawal.floor
  return fallback
}

function getFixedRateStepNote(language: UiLanguage): string {
  if (language === 'zh-Hant') {
    return '4% 法則會用退休時資產當基準，結果也會檢查提領是否足以支應基本生活費。'
  }
  if (language === 'ja') {
    return '4%ルールは退職時の資産を基準にし、結果では基本的な支出を満たせるかも確認します。'
  }
  return 'The 4% rule uses your portfolio at retirement as the base and checks basic spending adequacy.'
}

export function GuidedSimulator({ onOpenAdvanced, startOnResults }: {
  onOpenAdvanced: () => void
  startOnResults: boolean
}) {
  const store = useGameStore()
  const { language } = useI18n()
  const copy = GUIDED_COPY[language]
  const [step, setStep] = useState<GuidedStep>(startOnResults ? 'results' : 'basics')
  const [riskPreset, setRiskPreset] = useState<RiskPreset>(() => getRiskPreset(store.allocation))

  useEffect(() => {
    if (startOnResults) setStep('results')
  }, [startOnResults])

  const stepIndex = STEP_IDS.findIndex((item) => item === step)
  const cfg = REGION_CONFIGS[store.region]
  const lifestyleList = getLifestyleList(store.region)
  const fourPercentTarget = store.annualExpense / 0.04
  const fourPercentGap = fourPercentTarget - store.initialPortfolio
  const savingsRate = store.annualIncome > 0 ? store.annualContribution / store.annualIncome : 0
  const withdrawalAmount = getWithdrawalAmount(store.withdrawal, store.annualExpense)
  const allocationValid = Math.abs(allocationSum(store.allocation) - 1) <= 0.001
  const warnings = getWarnings({
    currentAge: store.currentAge,
    retirementAge: store.retirementAge,
    endAge: store.endAge,
    annualIncome: store.annualIncome,
    annualExpense: store.annualExpense,
    allocationValid,
  }, copy)

  const goNext = () => {
    if (stepIndex < STEP_IDS.length - 1) setStep(STEP_IDS[stepIndex + 1])
  }

  const goBack = () => {
    if (stepIndex > 0) setStep(STEP_IDS[stepIndex - 1])
  }

  const runAndShowResults = () => {
    store.setViewMode('simulation')
    store.runSimulation()
    setStep('results')
  }

  const setRisk = (preset: RiskPreset) => {
    setRiskPreset(preset)
    store.setAllocation(RISK_ALLOCATIONS[preset])
  }

  const verdict = useMemo(() => {
    const result = store.result
    if (!result) return null
    if (result.successRate >= 0.85) {
      return {
        title: copy.verdict.strongTitle,
        body: copy.verdict.strongBody,
      }
    }
    if (result.successRate >= 0.65) {
      return {
        title: copy.verdict.borderlineTitle,
        body: copy.verdict.borderlineBody,
      }
    }
    return {
      title: copy.verdict.fragileTitle,
      body: copy.verdict.fragileBody,
    }
  }, [copy, store.result])

  return (
    <div className="guidedSimulator">
      <div className="guidedSimulatorShell">
        <header className="guidedHero">
          <div>
            <p className="guidedEyebrow">{copy.heroEyebrow}</p>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
          </div>
          <Button className="guidedAdvanced" variant="outlined" startIcon={<TuneIcon />} onClick={onOpenAdvanced}>
            {copy.advanced}
          </Button>
        </header>

        <nav className="guidedStepper" aria-label="Simulator steps">
          {STEP_IDS.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`${item === step ? 'active' : ''} ${index < stepIndex ? 'done' : ''}`}
              onClick={() => setStep(item)}
            >
              {String(index + 1).padStart(2, '0')} / {copy.steps[item]}
            </button>
          ))}
        </nav>

        <section className="guidedPanel">
          {step === 'basics' && (
            <GuidedStep {...copy.stepContent.basics}>
              <div className="guidedGrid">
                <SelectField label={copy.labels.region} value={store.region} onChange={(value) => store.setRegion(value as Region)}>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>{getRegionLabel(region, language)} / {REGION_CONFIGS[region].currency}</option>
                  ))}
                </SelectField>
                <SelectField label={copy.labels.lifestyle} value={store.lifestyleId} onChange={(value) => value !== 'custom' && store.applyLifestyle(value as Exclude<LifestyleId, 'custom'>)}>
                  {store.lifestyleId === 'custom' && <option value="custom">{copy.custom}</option>}
                  {lifestyleList.map((preset) => {
                    const display = getLifestyleDisplay(store.region, preset.id as Exclude<LifestyleId, 'custom'>, language)
                    return <option key={preset.id} value={preset.id}>{display.name}</option>
                  })}
                </SelectField>
                <NumberField label={copy.labels.currentAge} value={store.currentAge} min={20} max={69} step={1} onChange={store.setCurrentAge} />
                <NumberField label={copy.labels.retirementAge} value={store.retirementAge} min={store.currentAge + 1} max={80} step={1} onChange={store.setRetirementAge} />
              </div>
              <Metrics>
                <Metric label={copy.labels.yearsToRetirement} value={`${Math.max(0, store.retirementAge - store.currentAge)}`} />
                <Metric label={copy.labels.scenario} value={store.lifestyleId === 'custom' ? copy.custom : getLifestyleDisplay(store.region, store.lifestyleId as Exclude<LifestyleId, 'custom'>, language).name} />
                <Metric label={copy.labels.currency} value={cfg.currency} />
                <Metric label={copy.labels.endAge} value={`${store.endAge}`} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'money' && (
            <GuidedStep {...copy.stepContent.money}>
              <div className="guidedGrid">
                <NumberField label={copy.labels.annualIncome} value={store.annualIncome} min={0} max={cfg.sliderRanges.annualIncome.max} step={cfg.sliderRanges.annualIncome.step} onChange={store.setAnnualIncome} />
                <NumberField label={copy.labels.annualSpending} value={store.annualExpense} min={0} max={cfg.sliderRanges.annualExpense.max} step={cfg.sliderRanges.annualExpense.step} onChange={(value) => {
                  store.setAnnualExpense(value)
                  if (store.withdrawal.type === 'fixed_amount') store.setWithdrawal({ type: 'fixed_amount', amount: value })
                }} />
                <NumberField label={copy.labels.annualInvest} value={store.annualContribution} min={0} max={cfg.sliderRanges.annualContribution.max} step={cfg.sliderRanges.annualContribution.step} onChange={store.setAnnualContribution} />
                <NumberField label={copy.labels.portfolioToday} value={store.initialPortfolio} min={0} max={cfg.sliderRanges.initialPortfolio.max} step={cfg.sliderRanges.initialPortfolio.step} onChange={store.setInitialPortfolio} />
              </div>
              <Metrics>
                <Metric label={copy.labels.monthlySpending} value={formatSliderValue(Math.round(store.annualExpense / 12), store.region, language)} />
                <Metric label={copy.labels.savingsRate} value={`${(savingsRate * 100).toFixed(0)}%`} />
                <Metric label={copy.labels.fourPercentTarget} value={formatCurrency(fourPercentTarget, store.region, language)} />
                <Metric label={copy.labels.gapToTarget} value={formatCurrency(fourPercentGap, store.region, language)} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'retirement' && (
            <GuidedStep {...copy.stepContent.retirement}>
              <div className="guidedGrid">
                <SelectField label={copy.labels.withdrawalStrategy} value={store.withdrawal.type} onChange={(value) => {
                  if (value === 'fixed_rate') store.setWithdrawal({ type: 'fixed_rate', rate: 0.04 })
                  if (value === 'fixed_amount') store.setWithdrawal({ type: 'fixed_amount', amount: store.annualExpense })
                  if (value === 'dynamic') store.setWithdrawal({ type: 'dynamic', floor: store.annualExpense * 0.7, ceiling: store.annualExpense * 1.5 })
                }}>
                  <option value="fixed_amount">{copy.withdrawal.fixed_amount}</option>
                  <option value="fixed_rate">{copy.withdrawal.fixed_rate}</option>
                  <option value="dynamic">{copy.withdrawal.dynamic}</option>
                </SelectField>
                <NumberField label={copy.labels.annualWithdrawal} value={withdrawalAmount} min={0} max={cfg.sliderRanges.withdrawalAmount.max} step={cfg.sliderRanges.withdrawalAmount.step} onChange={(value) => store.setWithdrawal({ type: 'fixed_amount', amount: value })} />
                <NumberField label={copy.labels.retirementAge} value={store.retirementAge} min={store.currentAge + 1} max={80} step={1} onChange={store.setRetirementAge} />
                <NumberField label={copy.labels.planUntilAge} value={store.endAge} min={store.retirementAge + 1} max={100} step={1} onChange={store.setEndAge} />
              </div>
              {store.withdrawal.type === 'fixed_rate' && (
                <p className="guidedInlineNote">{getFixedRateStepNote(language)}</p>
              )}
              <Metrics>
                <Metric label={copy.labels.retirementYears} value={`${Math.max(0, store.endAge - store.retirementAge)}`} />
                <Metric label={copy.labels.firstYearSpend} value={formatCurrency(withdrawalAmount, store.region, language)} />
                <Metric label={copy.labels.ruleOfThumb} value={formatCurrency(fourPercentTarget, store.region, language)} />
                <Metric label={copy.labels.portfolioToday} value={formatCurrency(store.initialPortfolio, store.region, language)} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'risk' && (
            <GuidedStep {...copy.stepContent.risk}>
              <div className="guidedChoiceGrid">
                <RiskChoice active={riskPreset === 'conservative'} title={copy.risk.conservative.title} body={copy.risk.conservative.body} onClick={() => setRisk('conservative')} />
                <RiskChoice active={riskPreset === 'balanced'} title={copy.risk.balanced.title} body={copy.risk.balanced.body} onClick={() => setRisk('balanced')} />
                <RiskChoice active={riskPreset === 'growth'} title={copy.risk.growth.title} body={copy.risk.growth.body} onClick={() => setRisk('growth')} />
              </div>
              <div className="guidedGrid three">
                <ToggleField label={copy.labels.randomEvents} checked={store.enableEvents} onChange={store.setEnableEvents} copy={copy} />
                <ToggleField label={copy.labels.housingPlan} checked={false} onChange={() => {}} copy={copy} disabled />
                <ToggleField label={copy.labels.occupationSimulation} checked={false} onChange={() => {}} copy={copy} disabled />
              </div>
              <Metrics>
                <Metric label={copy.labels.stockWeight} value={`${((store.allocation.sp500 + store.allocation.intlStock) * 100).toFixed(0)}%`} />
                <Metric label={copy.labels.bondWeight} value={`${(store.allocation.bond * 100).toFixed(0)}%`} />
                <Metric label={copy.labels.goldWeight} value={`${(store.allocation.gold * 100).toFixed(0)}%`} />
                <Metric label={copy.labels.cashWeight} value={`${(store.allocation.cash * 100).toFixed(0)}%`} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'review' && (
            <GuidedStep {...copy.stepContent.review}>
              <Metrics>
                <Metric label={copy.labels.timeline} value={`${store.currentAge} -> ${store.retirementAge} -> ${store.endAge}`} />
                <Metric label={copy.labels.incomeSpending} value={`${formatCurrency(store.annualIncome, store.region, language)} / ${formatCurrency(store.annualExpense, store.region, language)}`} />
                <Metric label={copy.labels.portfolioToday} value={formatCurrency(store.initialPortfolio, store.region, language)} />
                <Metric label={copy.labels.annualInvest} value={formatCurrency(store.annualContribution, store.region, language)} />
                <Metric label={copy.labels.riskPreset} value={copy.risk[riskPreset].title} />
                <Metric label={copy.labels.paths} value={store.numPaths.toLocaleString(language === 'zh-Hant' ? 'zh-TW' : language === 'ja' ? 'ja-JP' : 'en-US')} />
                <Metric label={copy.labels.events} value={store.enableEvents ? copy.on : copy.off} />
                <Metric label={copy.labels.withdrawal} value={copy.withdrawal[store.withdrawal.type]} />
              </Metrics>
              {warnings.length > 0 && (
                <div className="guidedWarningList">
                  {warnings.map((warning) => <div className="guidedWarning" key={warning}>{warning}</div>)}
                </div>
              )}
            </GuidedStep>
          )}

          {step === 'results' && (
            <GuidedStep {...copy.stepContent.results}>
              {store.isRunning && <LinearProgress sx={{ mt: 3 }} />}
              {verdict && (
                <div className="guidedVerdict">
                  <strong>{verdict.title}</strong>
                  <p>{verdict.body}</p>
                </div>
              )}
              {!store.isRunning && !store.result && (
                <div className="guidedVerdict">
                  <strong>{copy.noRunTitle}</strong>
                  <p>{copy.noRunBody}</p>
                </div>
              )}
              <div className="guidedGrid">
                <NumberField label={copy.labels.retirementAge} value={store.retirementAge} min={store.currentAge + 1} max={80} step={1} onChange={store.setRetirementAge} />
                <NumberField label={copy.labels.annualSpending} value={store.annualExpense} min={0} max={cfg.sliderRanges.annualExpense.max} step={cfg.sliderRanges.annualExpense.step} onChange={store.setAnnualExpense} />
                <NumberField label={copy.labels.annualInvest} value={store.annualContribution} min={0} max={cfg.sliderRanges.annualContribution.max} step={cfg.sliderRanges.annualContribution.step} onChange={store.setAnnualContribution} />
                <SelectField label={copy.labels.riskPreset} value={riskPreset} onChange={(value) => setRisk(value as RiskPreset)}>
                  <option value="conservative">{copy.risk.conservative.title}</option>
                  <option value="balanced">{copy.risk.balanced.title}</option>
                  <option value="growth">{copy.risk.growth.title}</option>
                </SelectField>
              </div>
              {store.result && (
                <div className="guidedResultsShell">
                  <ResultPanel />
                </div>
              )}
            </GuidedStep>
          )}

          <div className="guidedActions">
            <Button variant="outlined" startIcon={<TuneIcon />} onClick={onOpenAdvanced}>{copy.advanced}</Button>
            <div className="guidedActionGroup">
              <Button variant="outlined" startIcon={<ArrowBackIcon />} disabled={stepIndex === 0} onClick={goBack}>{copy.back}</Button>
              {step === 'review' ? (
                <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={warnings.length > 0 || store.isRunning} onClick={runAndShowResults}>
                  {copy.run}
                </Button>
              ) : step === 'results' ? (
                <Button variant="contained" startIcon={<BarChartIcon />} disabled={store.isRunning} onClick={runAndShowResults}>
                  {copy.runAgain}
                </Button>
              ) : (
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={goNext}>{copy.next}</Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function GuidedStep({ kicker, title, lead, children }: {
  kicker: string
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <div className="guidedStep">
      <p className="guidedStepKicker">{kicker}</p>
      <h2>{title}</h2>
      <p className="guidedStepLead">{lead}</p>
      {children}
    </div>
  )
}

function NumberField({ label, value, min, max, step, onChange }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="guidedField">
      <label>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value)
          if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)))
        }}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, children }: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div className="guidedField">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  )
}

function ToggleField({ label, checked, onChange, copy, disabled = false }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  copy: GuidedCopy
  disabled?: boolean
}) {
  return (
    <label className={`guidedChoice ${disabled ? 'disabled' : ''}`}>
      <strong>{label}</strong>
      <span>{disabled ? copy.blocked : checked ? copy.enabled : copy.disabled}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        style={{ marginTop: 16 }}
      />
    </label>
  )
}

function RiskChoice({ active, title, body, onClick }: {
  active: boolean
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button type="button" className={`guidedChoice ${active ? 'active' : ''}`} onClick={onClick}>
      <strong>{title}</strong>
      <span>{body}</span>
    </button>
  )
}

function Metrics({ children }: { children: ReactNode }) {
  return <div className="guidedMetrics">{children}</div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="guidedMetric">
      <span className="guidedMetricLabel">{label}</span>
      <span className="guidedMetricValue">{value}</span>
    </div>
  )
}

function getWarnings(input: {
  currentAge: number
  retirementAge: number
  endAge: number
  annualIncome: number
  annualExpense: number
  allocationValid: boolean
}, copy: GuidedCopy) {
  const warnings: string[] = []
  if (input.retirementAge <= input.currentAge) warnings.push(copy.warnings.retirementAge)
  if (input.endAge <= input.retirementAge) warnings.push(copy.warnings.endAge)
  if (input.annualExpense > input.annualIncome) warnings.push(copy.warnings.spending)
  if (!input.allocationValid) warnings.push(copy.warnings.allocation)
  return warnings
}
