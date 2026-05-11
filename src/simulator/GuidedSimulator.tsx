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
import { useGameStore } from '../store/gameStore'
import { ResultPanel } from '../components/ResultPanel'
import './GuidedSimulator.css'

type GuidedStep = 'basics' | 'money' | 'retirement' | 'risk' | 'review' | 'results'
type RiskPreset = 'conservative' | 'balanced' | 'growth'

const STEPS: { id: GuidedStep; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'money', label: 'Money' },
  { id: 'retirement', label: 'Plan' },
  { id: 'risk', label: 'Risk' },
  { id: 'review', label: 'Review' },
  { id: 'results', label: 'Results' },
]

const REGION_OPTIONS: Region[] = ['us', 'tw', 'jp', 'ph-manila', 'ph-cebu']

const RISK_ALLOCATIONS: Record<RiskPreset, Allocation> = {
  conservative: { sp500: 0.25, intlStock: 0.10, bond: 0.40, gold: 0.10, cash: 0.10, reits: 0.05 },
  balanced: { sp500: 0.45, intlStock: 0.15, bond: 0.20, gold: 0.10, cash: 0.05, reits: 0.05 },
  growth: { sp500: 0.60, intlStock: 0.20, bond: 0.10, gold: 0.05, cash: 0.00, reits: 0.05 },
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

export function GuidedSimulator({ onOpenAdvanced, startOnResults }: {
  onOpenAdvanced: () => void
  startOnResults: boolean
}) {
  const store = useGameStore()
  const { language } = useI18n()
  const [step, setStep] = useState<GuidedStep>(startOnResults ? 'results' : 'basics')
  const [riskPreset, setRiskPreset] = useState<RiskPreset>(() => getRiskPreset(store.allocation))

  useEffect(() => {
    if (startOnResults) setStep('results')
  }, [startOnResults])

  const stepIndex = STEPS.findIndex((item) => item.id === step)
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
  })

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].id)
  }

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id)
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
        title: 'Strong plan',
        body: 'Most simulated futures survive. You can use the quick refinements below to test how much flexibility you have.',
      }
    }
    if (result.successRate >= 0.65) {
      return {
        title: 'Borderline plan',
        body: 'The plan works in many futures, but not enough to ignore risk. Try retiring later, spending less, or investing more.',
      }
    }
    return {
      title: 'Fragile plan',
      body: 'Too many simulated futures run out of money. Start by reducing spending, increasing annual invest, or delaying retirement.',
    }
  }, [store.result])

  return (
    <div className="guidedSimulator">
      <div className="guidedSimulatorShell">
        <header className="guidedHero">
          <div>
            <p className="guidedEyebrow">Guided simulator</p>
            <h1>Build the plan one decision at a time.</h1>
            <p>Answer the few inputs that matter most first. Advanced assumptions stay available, but they no longer have to be the first thing you see.</p>
          </div>
          <Button className="guidedAdvanced" variant="outlined" startIcon={<TuneIcon />} onClick={onOpenAdvanced}>
            Advanced settings
          </Button>
        </header>

        <nav className="guidedStepper" aria-label="Simulator steps">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`${item.id === step ? 'active' : ''} ${index < stepIndex ? 'done' : ''}`}
              onClick={() => setStep(item.id)}
            >
              {String(index + 1).padStart(2, '0')} / {item.label}
            </button>
          ))}
        </nav>

        <section className="guidedPanel">
          {step === 'basics' && (
            <GuidedStep kicker="Step 1" title="Start with the basics" lead="Confirm the region, age timeline, and lifestyle preset before looking at investment details.">
              <div className="guidedGrid">
                <SelectField label="Region" value={store.region} onChange={(value) => store.setRegion(value as Region)}>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>{getRegionLabel(region, language)} / {REGION_CONFIGS[region].currency}</option>
                  ))}
                </SelectField>
                <SelectField label="Lifestyle" value={store.lifestyleId} onChange={(value) => value !== 'custom' && store.applyLifestyle(value as Exclude<LifestyleId, 'custom'>)}>
                  {store.lifestyleId === 'custom' && <option value="custom">Custom</option>}
                  {lifestyleList.map((preset) => {
                    const display = getLifestyleDisplay(store.region, preset.id as Exclude<LifestyleId, 'custom'>, language)
                    return <option key={preset.id} value={preset.id}>{display.name}</option>
                  })}
                </SelectField>
                <NumberField label="Current age" value={store.currentAge} min={20} max={69} step={1} onChange={store.setCurrentAge} />
                <NumberField label="Retirement age" value={store.retirementAge} min={store.currentAge + 1} max={80} step={1} onChange={store.setRetirementAge} />
              </div>
              <Metrics>
                <Metric label="Years to retirement" value={`${Math.max(0, store.retirementAge - store.currentAge)}`} />
                <Metric label="Scenario" value={store.lifestyleId === 'custom' ? 'Custom' : getLifestyleDisplay(store.region, store.lifestyleId as Exclude<LifestyleId, 'custom'>, language).name} />
                <Metric label="Currency" value={cfg.currency} />
                <Metric label="End age" value={`${store.endAge}`} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'money' && (
            <GuidedStep kicker="Step 2" title="Put the money in plain view" lead="This step shows whether the rough 4% target is already close or still far away.">
              <div className="guidedGrid">
                <NumberField label="Annual income" value={store.annualIncome} min={0} max={cfg.sliderRanges.annualIncome.max} step={cfg.sliderRanges.annualIncome.step} onChange={store.setAnnualIncome} />
                <NumberField label="Annual spending" value={store.annualExpense} min={0} max={cfg.sliderRanges.annualExpense.max} step={cfg.sliderRanges.annualExpense.step} onChange={(value) => {
                  store.setAnnualExpense(value)
                  if (store.withdrawal.type === 'fixed_amount') store.setWithdrawal({ type: 'fixed_amount', amount: value })
                }} />
                <NumberField label="Annual invest" value={store.annualContribution} min={0} max={cfg.sliderRanges.annualContribution.max} step={cfg.sliderRanges.annualContribution.step} onChange={store.setAnnualContribution} />
                <NumberField label="Portfolio today" value={store.initialPortfolio} min={0} max={cfg.sliderRanges.initialPortfolio.max} step={cfg.sliderRanges.initialPortfolio.step} onChange={store.setInitialPortfolio} />
              </div>
              <Metrics>
                <Metric label="Monthly spending" value={formatSliderValue(Math.round(store.annualExpense / 12), store.region, language)} />
                <Metric label="Savings rate" value={`${(savingsRate * 100).toFixed(0)}%`} />
                <Metric label="4% target" value={formatCurrency(fourPercentTarget, store.region, language)} />
                <Metric label="Gap to target" value={formatCurrency(fourPercentGap, store.region, language)} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'retirement' && (
            <GuidedStep kicker="Step 3" title="Decide how retirement spending works" lead="The simplest model spends your expected annual spending after retirement. You can still use advanced withdrawal rules later.">
              <div className="guidedGrid">
                <SelectField label="Withdrawal strategy" value={store.withdrawal.type} onChange={(value) => {
                  if (value === 'fixed_rate') store.setWithdrawal({ type: 'fixed_rate', rate: 0.04 })
                  if (value === 'fixed_amount') store.setWithdrawal({ type: 'fixed_amount', amount: store.annualExpense })
                  if (value === 'dynamic') store.setWithdrawal({ type: 'dynamic', floor: store.annualExpense * 0.7, ceiling: store.annualExpense * 1.5 })
                }}>
                  <option value="fixed_amount">Fixed amount</option>
                  <option value="fixed_rate">4% rule</option>
                  <option value="dynamic">Dynamic spending</option>
                </SelectField>
                <NumberField label="Annual withdrawal" value={withdrawalAmount} min={0} max={cfg.sliderRanges.withdrawalAmount.max} step={cfg.sliderRanges.withdrawalAmount.step} onChange={(value) => store.setWithdrawal({ type: 'fixed_amount', amount: value })} />
                <NumberField label="Retirement age" value={store.retirementAge} min={store.currentAge + 1} max={80} step={1} onChange={store.setRetirementAge} />
                <NumberField label="Plan until age" value={store.endAge} min={store.retirementAge + 1} max={100} step={1} onChange={store.setEndAge} />
              </div>
              <Metrics>
                <Metric label="Retirement years" value={`${Math.max(0, store.endAge - store.retirementAge)}`} />
                <Metric label="First-year spend" value={formatCurrency(withdrawalAmount, store.region, language)} />
                <Metric label="Rule of thumb" value={formatCurrency(fourPercentTarget, store.region, language)} />
                <Metric label="Current portfolio" value={formatCurrency(store.initialPortfolio, store.region, language)} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'risk' && (
            <GuidedStep kicker="Step 4" title="Choose a risk posture" lead="Pick a plain-language risk preset now. Custom asset sliders are still available in advanced settings.">
              <div className="guidedChoiceGrid">
                <RiskChoice active={riskPreset === 'conservative'} title="Conservative" body="Lower stock exposure, more bonds and cash." onClick={() => setRisk('conservative')} />
                <RiskChoice active={riskPreset === 'balanced'} title="Balanced" body="A mixed allocation for growth and stability." onClick={() => setRisk('balanced')} />
                <RiskChoice active={riskPreset === 'growth'} title="Growth" body="Higher stock exposure and larger swings." onClick={() => setRisk('growth')} />
              </div>
              <div className="guidedGrid three">
                <ToggleField label="Random events" checked={store.enableEvents} onChange={store.setEnableEvents} />
                <ToggleField label="Housing plan" checked={store.housingEnabled} onChange={store.setHousingEnabled} />
                <ToggleField label="Occupation simulation" checked={store.occupationEnabled} onChange={store.setOccupationEnabled} />
              </div>
              <Metrics>
                <Metric label="Stock weight" value={`${((store.allocation.sp500 + store.allocation.intlStock) * 100).toFixed(0)}%`} />
                <Metric label="Bond weight" value={`${(store.allocation.bond * 100).toFixed(0)}%`} />
                <Metric label="Gold weight" value={`${(store.allocation.gold * 100).toFixed(0)}%`} />
                <Metric label="Allocation total" value={`${(allocationSum(store.allocation) * 100).toFixed(0)}%`} />
              </Metrics>
            </GuidedStep>
          )}

          {step === 'review' && (
            <GuidedStep kicker="Step 5" title="Review before running" lead="This is the complete first version of your plan. Run it now, then refine after seeing the survival rate.">
              <Metrics>
                <Metric label="Timeline" value={`${store.currentAge} -> ${store.retirementAge} -> ${store.endAge}`} />
                <Metric label="Income / spending" value={`${formatCurrency(store.annualIncome, store.region, language)} / ${formatCurrency(store.annualExpense, store.region, language)}`} />
                <Metric label="Portfolio today" value={formatCurrency(store.initialPortfolio, store.region, language)} />
                <Metric label="Annual invest" value={formatCurrency(store.annualContribution, store.region, language)} />
                <Metric label="Risk preset" value={riskPreset} />
                <Metric label="Paths" value={store.numPaths.toLocaleString(language === 'zh-Hant' ? 'zh-TW' : language === 'ja' ? 'ja-JP' : 'en-US')} />
                <Metric label="Events" value={store.enableEvents ? 'On' : 'Off'} />
                <Metric label="Withdrawal" value={store.withdrawal.type.replace('_', ' ')} />
              </Metrics>
              {warnings.length > 0 && (
                <div className="guidedWarningList">
                  {warnings.map((warning) => <div className="guidedWarning" key={warning}>{warning}</div>)}
                </div>
              )}
            </GuidedStep>
          )}

          {step === 'results' && (
            <GuidedStep kicker="Step 6" title="Read the result, then refine" lead="The first run gives you a survival rate. Use the quick controls below to test the most important levers.">
              {store.isRunning && <LinearProgress sx={{ mt: 3 }} />}
              {verdict && (
                <div className="guidedVerdict">
                  <strong>{verdict.title}</strong>
                  <p>{verdict.body}</p>
                </div>
              )}
              {!store.isRunning && !store.result && (
                <div className="guidedVerdict">
                  <strong>No run yet</strong>
                  <p>Review your assumptions, then run the simulation to see the survival rate and detailed charts.</p>
                </div>
              )}
              <div className="guidedGrid">
                <NumberField label="Retirement age" value={store.retirementAge} min={store.currentAge + 1} max={80} step={1} onChange={store.setRetirementAge} />
                <NumberField label="Annual spending" value={store.annualExpense} min={0} max={cfg.sliderRanges.annualExpense.max} step={cfg.sliderRanges.annualExpense.step} onChange={store.setAnnualExpense} />
                <NumberField label="Annual invest" value={store.annualContribution} min={0} max={cfg.sliderRanges.annualContribution.max} step={cfg.sliderRanges.annualContribution.step} onChange={store.setAnnualContribution} />
                <SelectField label="Risk preset" value={riskPreset} onChange={(value) => setRisk(value as RiskPreset)}>
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="growth">Growth</option>
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
            <Button variant="outlined" startIcon={<TuneIcon />} onClick={onOpenAdvanced}>Advanced settings</Button>
            <div className="guidedActionGroup">
              <Button variant="outlined" startIcon={<ArrowBackIcon />} disabled={stepIndex === 0} onClick={goBack}>Back</Button>
              {step === 'review' ? (
                <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={warnings.length > 0 || store.isRunning} onClick={runAndShowResults}>
                  Run simulation
                </Button>
              ) : step === 'results' ? (
                <Button variant="contained" startIcon={<BarChartIcon />} disabled={store.isRunning} onClick={runAndShowResults}>
                  Run again
                </Button>
              ) : (
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={goNext}>Next</Button>
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

function ToggleField({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="guidedChoice">
      <strong>{label}</strong>
      <span>{checked ? 'Enabled' : 'Disabled'}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} style={{ marginTop: 16 }} />
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
}) {
  const warnings: string[] = []
  if (input.retirementAge <= input.currentAge) warnings.push('Retirement age must be after current age.')
  if (input.endAge <= input.retirementAge) warnings.push('Plan end age must be after retirement age.')
  if (input.annualExpense > input.annualIncome) warnings.push('Annual spending is higher than annual income.')
  if (!input.allocationValid) warnings.push('Allocation must total 100%.')
  return warnings
}
