/**
 * 單條路徑模擬器
 *
 * 模擬邏輯（每年）：
 * 1. Block Bootstrap 抽出該年各資產報酬
 * 2. （可選）觸發隨機事件，影響資產/收入
 * 3. 依玩家資產配置計算加權報酬
 * 4. 資產成長：portfolio *= (1 + weightedReturn)
 * 5. 扣除提領金額（通膨調整後）
 * 6. 檢查破產（資產 ≤ 0）
 */

import { blockBootstrap, type HistoricalData, type YearReturns } from './bootstrap'
import { rollEventsForYear } from '../events/eventEngine'
import type { TriggeredEvent } from '../events/eventTypes'
import type { Region } from '../config/regions'

/** 資產配置權重（總和必須為 1） */
export interface Allocation {
  sp500: number
  bond: number
  gold: number
  cash: number
  reits: number
}

/** 提領策略 */
export type WithdrawalStrategy =
  | { type: 'fixed_rate'; rate: number }
  | { type: 'fixed_amount'; amount: number }
  | { type: 'dynamic'; floor: number; ceiling: number }

/** 模擬參數 */
export interface SimulationParams {
  currentAge: number
  retirementAge: number
  endAge: number
  initialPortfolio: number
  annualContribution: number
  annualIncome: number      // 年收入（事件影響計算用）
  allocation: Allocation
  withdrawal: WithdrawalStrategy
  enableEvents: boolean     // 是否啟用隨機事件
  region?: Region           // 地區（影響事件資料庫）
}

/** 單年模擬快照 */
export interface YearSnapshot {
  age: number
  year: number
  portfolioStart: number
  returns: YearReturns
  weightedReturn: number
  withdrawal: number
  contribution: number
  portfolioEnd: number
  cumulativeInflation: number
  bankrupt: boolean
  events: TriggeredEvent[]       // 該年觸發的事件
  eventPortfolioImpact: number   // 事件對資產的影響
  eventIncomeImpact: number      // 事件對收入的影響
  eventExpense: number           // 事件額外支出
}

/** 單條路徑結果 */
export interface PathResult {
  seed: number
  snapshots: YearSnapshot[]
  finalPortfolio: number
  bankrupt: boolean
  bankruptAge: number | null
  allEvents: TriggeredEvent[]    // 整條路徑所有觸發事件
}

const ASSET_KEYS: (keyof Allocation)[] = ['sp500', 'bond', 'gold', 'cash', 'reits']

function validateAllocation(alloc: Allocation): void {
  const sum = ASSET_KEYS.reduce((s, k) => s + alloc[k], 0)
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(`資產配置權重總和必須為 1，目前為 ${sum.toFixed(4)}`)
  }
}

function calcWeightedReturn(returns: YearReturns, alloc: Allocation): number {
  return ASSET_KEYS.reduce((sum, key) => sum + alloc[key] * returns[key], 0)
}

function calcWithdrawal(
  strategy: WithdrawalStrategy,
  initialPortfolio: number,
  currentPortfolio: number,
  cumulativeInflation: number,
): number {
  switch (strategy.type) {
    case 'fixed_rate':
      return initialPortfolio * strategy.rate * cumulativeInflation
    case 'fixed_amount':
      return strategy.amount * cumulativeInflation
    case 'dynamic': {
      const base = currentPortfolio * 0.04
      const floor = strategy.floor * cumulativeInflation
      const ceiling = strategy.ceiling * cumulativeInflation
      return Math.max(floor, Math.min(ceiling, base))
    }
  }
}

export function simulatePath(
  data: HistoricalData,
  params: SimulationParams,
  seed: number,
): PathResult {
  validateAllocation(params.allocation)

  const totalYears = params.endAge - params.currentAge
  const returnSequence = blockBootstrap(data, totalYears, seed)

  let portfolio = params.initialPortfolio
  let cumulativeInflation = 1.0
  let bankrupt = false
  let bankruptAge: number | null = null
  let effectiveIncome = params.annualIncome
  const snapshots: YearSnapshot[] = []
  const allEvents: TriggeredEvent[] = []

  for (let y = 0; y < totalYears; y++) {
    const age = params.currentAge + y
    const yearReturns = returnSequence[y]
    const portfolioStart = portfolio

    if (y > 0) {
      cumulativeInflation *= 1 + yearReturns.cpi
    }

    // === 隨機事件 ===
    let events: TriggeredEvent[] = []
    let eventPortfolioImpact = 0
    let eventIncomeImpact = 0
    let eventExpense = 0

    if (params.enableEvents && !bankrupt) {
      // 每年事件用不同 seed（路徑 seed + 年份偏移）
      const eventSeed = seed * 1000 + y * 37
      const isRetired = age >= params.retirementAge
      const result = rollEventsForYear(eventSeed, age, y, portfolio, effectiveIncome, isRetired, params.region ?? 'us')
      events = result.events
      eventPortfolioImpact = result.totalPortfolioImpact
      eventIncomeImpact = result.totalIncomeImpact
      eventExpense = result.totalExpense
      allEvents.push(...events)

      // 套用事件影響
      portfolio += eventPortfolioImpact
      if (portfolio < 0) portfolio = 0

      // 永久性收入變化
      for (const evt of events) {
        for (const impact of evt.actualImpacts) {
          if (impact.type === 'income_boost') {
            effectiveIncome += impact.amount
          }
        }
      }
    }

    // === 正常模擬流程 ===
    const isRetired = age >= params.retirementAge
    let contribution = 0
    let withdrawal = 0

    if (!isRetired && !bankrupt) {
      contribution = params.annualContribution * cumulativeInflation
    } else if (!bankrupt) {
      withdrawal = calcWithdrawal(
        params.withdrawal,
        params.initialPortfolio,
        portfolio,
        cumulativeInflation,
      )
    }

    portfolio += contribution

    const weightedReturn = calcWeightedReturn(yearReturns, params.allocation)
    portfolio *= 1 + weightedReturn

    portfolio -= withdrawal

    // 扣除事件額外支出
    portfolio -= eventExpense

    if (portfolio <= 0 && !bankrupt) {
      portfolio = 0
      bankrupt = true
      bankruptAge = age
    }

    snapshots.push({
      age,
      year: y,
      portfolioStart,
      returns: yearReturns,
      weightedReturn,
      withdrawal,
      contribution,
      portfolioEnd: portfolio,
      cumulativeInflation,
      bankrupt,
      events,
      eventPortfolioImpact,
      eventIncomeImpact,
      eventExpense,
    })
  }

  return {
    seed,
    snapshots,
    finalPortfolio: portfolio,
    bankrupt,
    bankruptAge,
    allEvents,
  }
}
