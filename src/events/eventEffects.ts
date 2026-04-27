import type { ImpactType, TriggeredEvent } from './eventTypes'

export interface CalculatedImpact {
  type: ImpactType
  description: string
  amount: number
  permanent?: boolean
}

export interface NormalizedEventEffects {
  portfolioDeltaImmediate: number
  expenseDeltaImmediate: number
  incomeDeltaCurrentYear: number
  incomeDeltaPermanent: number
  expenseDeltaPermanent: number
  totalIncomeImpact: number
}

export function calcImpactAmount(
  type: ImpactType,
  value: number,
  portfolio: number,
  annualIncome: number,
): { amount: number; description: string } {
  const monthlyIncome = annualIncome / 12

  switch (type) {
    case 'income_change':
      return {
        amount: annualIncome * value,
        description: `收入 ${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`,
      }
    case 'savings_change':
      return {
        amount: portfolio * value,
        description: `儲蓄 ${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`,
      }
    case 'portfolio_change':
      return {
        amount: portfolio * value,
        description: `投資組合 ${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`,
      }
    case 'extra_expense':
      return {
        amount: -(monthlyIncome * value),
        description: `額外支出 ${value.toFixed(1)}x 月收入`,
      }
    case 'income_boost':
      return {
        amount: annualIncome * value,
        description: `收入永久 ${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`,
      }
    case 'savings_boost':
      return {
        amount: portfolio * value,
        description: value >= 0
          ? `儲蓄 +${(value * 100).toFixed(0)}%`
          : `儲蓄 ${(value * 100).toFixed(0)}%`,
      }
  }
}

export function normalizeTriggeredEvents(
  events: TriggeredEvent[],
  portfolio: number,
  annualIncome: number,
): NormalizedEventEffects {
  let portfolioDeltaImmediate = 0
  let expenseDeltaImmediate = 0
  let incomeDeltaCurrentYear = 0
  let incomeDeltaPermanent = 0
  let expenseDeltaPermanent = 0

  for (const evt of events) {
    let eventPortfolioNegative = 0
    let eventPortfolioPositive = 0

    for (const impact of evt.actualImpacts) {
      if (impact.type === 'portfolio_change' || impact.type === 'savings_change') {
        if (impact.amount < 0) eventPortfolioNegative = Math.min(eventPortfolioNegative, impact.amount)
        else eventPortfolioPositive = Math.max(eventPortfolioPositive, impact.amount)
        continue
      }

      if (impact.type === 'extra_expense') {
        expenseDeltaImmediate += Math.abs(impact.amount)
        continue
      }

      if (impact.type === 'income_boost' || (impact.type === 'income_change' && impact.permanent)) {
        incomeDeltaPermanent += impact.amount
        continue
      }

      if (impact.type === 'income_change') {
        incomeDeltaCurrentYear += impact.amount
        continue
      }

      if (impact.type === 'savings_boost') {
        if (impact.permanent) expenseDeltaPermanent += impact.amount
        else portfolioDeltaImmediate += impact.amount
      }
    }

    portfolioDeltaImmediate += eventPortfolioNegative + eventPortfolioPositive
  }

  const maxPortfolioLoss = -portfolio * 0.30
  if (portfolioDeltaImmediate < maxPortfolioLoss) {
    portfolioDeltaImmediate = maxPortfolioLoss
  }

  const maxExpense = (annualIncome / 12) * 3
  if (expenseDeltaImmediate > maxExpense) {
    expenseDeltaImmediate = maxExpense
  }

  return {
    portfolioDeltaImmediate,
    expenseDeltaImmediate,
    incomeDeltaCurrentYear,
    incomeDeltaPermanent,
    expenseDeltaPermanent,
    totalIncomeImpact: incomeDeltaCurrentYear + incomeDeltaPermanent,
  }
}
