import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './CompoundInterestCalculator.css'

type FrequencyKey = 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily'

interface FrequencyOption {
  key: FrequencyKey
  label: string
  periodsPerYear: number
}

interface Projection {
  label: string
  annualRate: number
  finalBalance: number
  totalContributions: number
  totalInterest: number
  yearlyBalances: number[]
}

const frequencyOptions: FrequencyOption[] = [
  { key: 'annually', label: 'Annually', periodsPerYear: 1 },
  { key: 'semiannually', label: 'Semiannually', periodsPerYear: 2 },
  { key: 'quarterly', label: 'Quarterly', periodsPerYear: 4 },
  { key: 'monthly', label: 'Monthly', periodsPerYear: 12 },
  { key: 'daily', label: 'Daily', periodsPerYear: 365 },
]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function calculateFutureValue(
  initialInvestment: number,
  monthlyContribution: number,
  years: number,
  annualRatePercent: number,
  periodsPerYear: number,
) {
  const months = Math.max(0, Math.round(years * 12))
  const annualRate = annualRatePercent / 100
  const totalContributions = monthlyContribution * months

  if (months === 0) {
    return {
      finalBalance: initialInvestment,
      totalContributions,
      totalInterest: 0,
      yearlyBalances: [initialInvestment],
    }
  }

  const yearlyBalances: number[] = [initialInvestment]

  if (annualRate === 0) {
    for (let month = 1; month <= months; month += 1) {
      if (month % 12 === 0 || month === months) {
        yearlyBalances.push(initialInvestment + monthlyContribution * month)
      }
    }
    const finalBalance = initialInvestment + totalContributions
    return {
      finalBalance,
      totalContributions,
      totalInterest: 0,
      yearlyBalances,
    }
  }

  const periodRate = annualRate / periodsPerYear
  const monthlyGrowth = Math.pow(1 + periodRate, periodsPerYear / 12)
  let balance = initialInvestment

  for (let month = 1; month <= months; month += 1) {
    balance = balance * monthlyGrowth + monthlyContribution
    if (month % 12 === 0 || month === months) {
      yearlyBalances.push(balance)
    }
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest: balance - initialInvestment - totalContributions,
    yearlyBalances,
  }
}

function buildProjection(
  label: string,
  initialInvestment: number,
  monthlyContribution: number,
  years: number,
  annualRate: number,
  periodsPerYear: number,
): Projection {
  const result = calculateFutureValue(
    initialInvestment,
    monthlyContribution,
    years,
    annualRate,
    periodsPerYear,
  )

  return {
    label,
    annualRate,
    ...result,
  }
}

export function CompoundInterestCalculator() {
  const [initialInvestment, setInitialInvestment] = useState('10000')
  const [monthlyContribution, setMonthlyContribution] = useState('100')
  const [years, setYears] = useState('10')
  const [interestRate, setInterestRate] = useState('5')
  const [varianceRange, setVarianceRange] = useState('0')
  const [frequency, setFrequency] = useState<FrequencyKey>('annually')

  useEffect(() => {
    document.title = 'Compound Interest Calculator'
  }, [])

  const selectedFrequency = frequencyOptions.find((option) => option.key === frequency) ?? frequencyOptions[0]

  const projections = useMemo(() => {
    const initial = Math.max(0, parseNumber(initialInvestment, 0))
    const contribution = parseNumber(monthlyContribution, 0)
    const length = clamp(parseNumber(years, 0), 0, 100)
    const baseRate = clamp(parseNumber(interestRate, 0), -99, 100)
    const variance = Math.max(0, parseNumber(varianceRange, 0))
    const lowRate = clamp(baseRate - variance, -99, 100)
    const highRate = clamp(baseRate + variance, -99, 100)

    if (variance === 0) {
      return [
        buildProjection('Estimated', initial, contribution, length, baseRate, selectedFrequency.periodsPerYear),
      ]
    }

    return [
      buildProjection('Lower range', initial, contribution, length, lowRate, selectedFrequency.periodsPerYear),
      buildProjection('Estimated', initial, contribution, length, baseRate, selectedFrequency.periodsPerYear),
      buildProjection('Upper range', initial, contribution, length, highRate, selectedFrequency.periodsPerYear),
    ]
  }, [frequency, initialInvestment, interestRate, monthlyContribution, selectedFrequency.periodsPerYear, varianceRange, years])

  const estimatedProjection = projections.find((projection) => projection.label === 'Estimated') ?? projections[0]
  const maxFinalBalance = Math.max(...projections.map((projection) => Math.abs(projection.finalBalance)), 1)
  const maxChartBalance = Math.max(...estimatedProjection.yearlyBalances.map((value) => Math.abs(value)), 1)

  return (
    <main className="compoundPage">
      <nav className="compoundTopNav" aria-label="Calculator navigation">
        <Link to="/" className="compoundBrand">Monte Carlo<span>.</span></Link>
        <Link to="/simulator" className="compoundNavLink">Simulator</Link>
      </nav>

      <section className="compoundHero">
        <div>
          <p className="compoundEyebrow">Financial calculator</p>
          <h1>Compound Interest Calculator</h1>
          <p>
            Estimate how an initial investment, monthly contributions, time, interest rates,
            and compounding frequency can change an investment balance.
          </p>
        </div>
        <div className="compoundSummary" aria-live="polite">
          <span>Estimated final balance</span>
          <strong>{currencyFormatter.format(estimatedProjection.finalBalance)}</strong>
          <p>
            {percentFormatter.format(estimatedProjection.annualRate)}% annual interest,
            compounded {selectedFrequency.label.toLowerCase()}.
          </p>
        </div>
      </section>

      <section className="compoundWorkspace">
        <form className="compoundForm">
          <Step title="Step 1: Initial Investment">
            <NumberField
              label="Initial Investment"
              description="Amount of money that you have available to invest initially."
              value={initialInvestment}
              min={0}
              step={100}
              prefix="$"
              onChange={setInitialInvestment}
            />
          </Step>

          <Step title="Step 2: Contribute">
            <NumberField
              label="Monthly Contribution"
              description="Amount that you plan to add to the principal every month, or a negative number for the amount that you plan to withdraw every month."
              value={monthlyContribution}
              step={50}
              prefix="$"
              onChange={setMonthlyContribution}
            />
            <NumberField
              label="Length of Time in Years"
              description="Length of time, in years, that you plan to save."
              value={years}
              min={0}
              max={100}
              step={1}
              onChange={setYears}
            />
          </Step>

          <Step title="Step 3: Interest Rate">
            <NumberField
              label="Estimated Interest Rate"
              description="Your estimated annual interest rate."
              value={interestRate}
              min={-99}
              max={100}
              step={0.1}
              suffix="%"
              onChange={setInterestRate}
            />
            <NumberField
              label="Interest rate variance range"
              description="Range of interest rates, above and below the rate set above, that you desire to see results for."
              value={varianceRange}
              min={0}
              max={100}
              step={0.1}
              suffix="%"
              onChange={setVarianceRange}
            />
          </Step>

          <Step title="Step 4: Compound It">
            <label className="compoundField">
              <span>Compound Frequency</span>
              <small>Times per year that interest will be compounded.</small>
              <select value={frequency} onChange={(event) => setFrequency(event.target.value as FrequencyKey)}>
                {frequencyOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </Step>
        </form>

        <aside className="compoundResults" aria-label="Compound interest results">
          <div className="compoundResultHeader">
            <div>
              <p className="compoundEyebrow">Results</p>
              <h2>{currencyFormatter.format(estimatedProjection.finalBalance)}</h2>
            </div>
            <span>{selectedFrequency.label}</span>
          </div>

          <div className="compoundMetrics">
            <Metric label="Initial investment" value={currencyFormatter.format(parseNumber(initialInvestment, 0))} />
            <Metric label="Total monthly contributions" value={currencyFormatter.format(estimatedProjection.totalContributions)} />
            <Metric label="Total interest" value={currencyFormatter.format(estimatedProjection.totalInterest)} />
          </div>

          <div className="compoundRangeBars">
            {projections.map((projection) => (
              <div className="compoundRangeRow" key={projection.label}>
                <div>
                  <span>{projection.label}</span>
                  <strong>{currencyFormatter.format(projection.finalBalance)}</strong>
                </div>
                <div className="compoundBarTrack" aria-hidden="true">
                  <span style={{ width: `${Math.max(4, (Math.abs(projection.finalBalance) / maxFinalBalance) * 100)}%` }} />
                </div>
                <small>{percentFormatter.format(projection.annualRate)}%</small>
              </div>
            ))}
          </div>

          <div className="compoundChart" aria-label="Estimated balance by year">
            {estimatedProjection.yearlyBalances.map((balance, index) => (
              <div className="compoundChartColumn" key={`${index}-${balance}`}>
                <span
                  style={{ height: `${Math.max(4, (Math.abs(balance) / maxChartBalance) * 100)}%` }}
                  className={balance < 0 ? 'negative' : ''}
                />
                <small>{index}</small>
              </div>
            ))}
          </div>

          <table className="compoundTable">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Rate</th>
                <th>Final balance</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((projection) => (
                <tr key={projection.label}>
                  <td>{projection.label}</td>
                  <td>{percentFormatter.format(projection.annualRate)}%</td>
                  <td>{currencyFormatter.format(projection.finalBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </section>
    </main>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="compoundStep">
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

function NumberField({
  label,
  description,
  value,
  min,
  max,
  step,
  prefix,
  suffix,
  onChange,
}: {
  label: string
  description: string
  value: string
  min?: number
  max?: number
  step: number
  prefix?: string
  suffix?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="compoundField">
      <span>{label}</span>
      <small>{description}</small>
      <div className="compoundInputWrap">
        {prefix && <b>{prefix}</b>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <b>{suffix}</b>}
      </div>
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="compoundMetric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
