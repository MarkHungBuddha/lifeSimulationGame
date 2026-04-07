/**
 * 單條路徑模擬器
 *
 * 模擬邏輯（每年）：
 * 1. Block Bootstrap 抽出該年各資產報酬
 * 2. （可選）觸發隨機事件，影響資產/收入
 * 3. （可選）購屋處理：頭期款、房貸、持有成本
 * 4. 依玩家資產配置計算加權報酬
 * 5. 資產成長：portfolio *= (1 + weightedReturn)
 * 6. 扣除提領金額（通膨調整後）
 * 7. 檢查破產（資產 ≤ 0）
 */

import { blockBootstrap, type HistoricalData, type YearReturns } from './bootstrap'
import { rollEventsForYear } from '../events/eventEngine'
import { createSeededRNG } from './rng'
import { processImmigrationYear } from './immigrationEngine'
import type { ImmigrationPlan, ImmigrationState, ImmigrationPhase } from './immigrationTypes'
import { INITIAL_IMMIGRATION_STATE } from './immigrationTypes'
import { processHousingYear } from './housingEngine'
import { HOUSING_PARAMS } from './housingData'
import type { HousingPlan, HousingState, YearHousingSnapshot } from './housingTypes'
import { INITIAL_HOUSING_STATE } from './housingTypes'
import { getAnnualRaise } from './occupationEngine'
import type { OccupationPlan } from './occupationTypes'
import type { TriggeredEvent } from '../events/eventTypes'
import type { Region } from '../config/regions'

/** 資產配置權重（總和必須為 1） */
export interface Allocation {
  sp500: number
  intlStock: number
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
  immigrationPlan?: ImmigrationPlan  // 移民計畫
  housingPlan?: HousingPlan          // 購屋計畫
  occupationPlan?: OccupationPlan    // 職業計畫
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
  immigrationPhase?: ImmigrationPhase   // 移民階段
  activeRegion?: Region                  // 該年實際所在國家
  housing?: YearHousingSnapshot          // 購屋快照
  currentSalary?: number                 // 職業啟用時的當前年薪
  raiseRate?: number                     // 職業啟用時的當年加薪率
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

const ASSET_KEYS: (keyof Allocation)[] = ['sp500', 'intlStock', 'bond', 'gold', 'cash', 'reits']

function validateAllocation(alloc: Allocation): void {
  const sum = ASSET_KEYS.reduce((s, k) => s + alloc[k], 0)
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(`資產配置權重總和必須為 1，目前為 ${sum.toFixed(4)}`)
  }
}

function calcWeightedReturn(returns: YearReturns, alloc: Allocation): number {
  return ASSET_KEYS.reduce((sum, key) => {
    // intlStock 使用 sp500 的歷史報酬（我們只有美國歷史數據）
    const retKey = key === 'intlStock' ? 'sp500' : key
    return sum + alloc[key] * returns[retKey]
  }, 0)
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

/** Box-Muller 轉換：從均勻分布生成標準常態分布 */
function boxMuller(rng: () => number): number {
  const u1 = rng()
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2)
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
  let immState: ImmigrationState = { ...INITIAL_IMMIGRATION_STATE }
  let housingState: HousingState = { ...INITIAL_HOUSING_STATE }
  const immRng = createSeededRNG(seed * 7919 + 13)  // 移民用獨立 RNG
  const housingRng = createSeededRNG(seed * 6271 + 37)  // 購屋用獨立 RNG
  const occRng = createSeededRNG(seed * 8761 + 29)  // 職業用獨立 RNG
  const snapshots: YearSnapshot[] = []
  const allEvents: TriggeredEvent[] = []
  const baseSavingsRate = params.annualIncome > 0
    ? params.annualContribution / params.annualIncome : 0

  for (let y = 0; y < totalYears; y++) {
    const age = params.currentAge + y
    const yearReturns = returnSequence[y]
    const portfolioStart = portfolio

    if (y > 0) {
      cumulativeInflation *= 1 + yearReturns.cpi
    }

    const isRetired = age >= params.retirementAge

    // === 移民處理 ===
    let activeRegion = params.region ?? 'us'
    let immIncomeMultiplier = 1
    let immExpenseMultiplier = 1
    let immCost = 0
    let immigrationEvents: TriggeredEvent[] = []
    let effectiveAllocation = params.allocation

    if (params.immigrationPlan?.enabled && !bankrupt) {
      const immResult = processImmigrationYear(
        immState, params.immigrationPlan,
        age, y, portfolio, effectiveIncome, immRng,
      )
      immState = immResult.newState
      activeRegion = immResult.activeRegion
      immIncomeMultiplier = immResult.incomeMultiplier
      immExpenseMultiplier = immResult.expenseMultiplier
      immCost = immResult.costThisYear
      immigrationEvents = immResult.immigrationEvents
      if (immResult.switchedAllocation) {
        effectiveAllocation = immResult.switchedAllocation
      }

      // 扣除移民成本
      portfolio -= immCost
      if (portfolio < 0) portfolio = 0

      // 移民事件中的永久收入變化
      for (const evt of immigrationEvents) {
        for (const impact of evt.actualImpacts) {
          if (impact.type === 'income_boost') {
            effectiveIncome += impact.amount
          }
        }
      }
    }

    // === 隨機事件（使用 activeRegion）===
    let events: TriggeredEvent[] = []
    let eventPortfolioImpact = 0
    let eventIncomeImpact = 0
    let eventExpense = 0

    if (params.enableEvents && !bankrupt) {
      const eventSeed = seed * 1000 + y * 37
      const ownsHome = housingState.phase === 'purchased' || housingState.phase === 'paid_off'
      const housingModuleEnabled = !!params.housingPlan?.enabled
      const result = rollEventsForYear({
        seed: eventSeed, age, year: y, portfolio, annualIncome: effectiveIncome,
        isRetired, region: activeRegion, ownsHome, housingModuleEnabled,
        occupationId: params.occupationPlan?.enabled ? params.occupationPlan.occupationId : 0,
      })
      events = result.events
      eventPortfolioImpact = result.totalPortfolioImpact
      eventIncomeImpact = result.totalIncomeImpact
      eventExpense = result.totalExpense

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

    // === 職業薪資成長 ===
    let currentRaiseRate = 0
    if (!isRetired && !bankrupt && params.occupationPlan?.enabled) {
      currentRaiseRate = getAnnualRaise(
        params.occupationPlan.occupationId,
        age,
        activeRegion,
        occRng,
      )
      effectiveIncome *= (1 + currentRaiseRate)
    }

    // 合併移民事件到事件列表
    events = [...events, ...immigrationEvents]
    allEvents.push(...events)

    // === 購屋處理 ===
    let housingSnapshot: YearHousingSnapshot | undefined
    let housingUpfrontCost = 0
    let annualHousingExpense = 0

    if (params.housingPlan?.enabled && !bankrupt) {
      const adjustedIncome = effectiveIncome * immIncomeMultiplier * cumulativeInflation
      const normalRandom = boxMuller(housingRng)
      const housingResult = processHousingYear(
        housingState,
        params.housingPlan,
        age,
        adjustedIncome,
        portfolio,
        activeRegion,
        normalRandom,
      )
      housingState = housingResult.newState
      housingSnapshot = housingResult.snapshot
      housingUpfrontCost = housingResult.upfrontCost
      annualHousingExpense = housingResult.annualHousingExpense

      // 扣除購屋頭期款+交易成本
      portfolio -= housingUpfrontCost
      if (portfolio < 0) portfolio = 0

      // 退休後已繳清房貸：持有成本改以購入價計算（不隨通膨房價膨脹）
      if (isRetired && housingState.phase === 'paid_off' && annualHousingExpense > 0) {
        const hParams = HOUSING_PARAMS[activeRegion]
        annualHousingExpense = housingState.purchasePrice * hParams.annualHoldingCostRatio
      }
    }

    // === 正常模擬流程（套用移民收入/支出倍率）===
    let contribution = 0
    let withdrawal = 0

    if (!isRetired && !bankrupt) {
      contribution = effectiveIncome * baseSavingsRate * cumulativeInflation * immIncomeMultiplier
      // 移民後支出增加 → 可存入額減少
      if (immExpenseMultiplier > 1) {
        const extraExpense = params.annualContribution * cumulativeInflation * (immExpenseMultiplier - 1) * 0.5
        contribution = Math.max(0, contribution - extraExpense)
      }
      // 購屋後房貸+持有成本 → 可存入額減少
      contribution = Math.max(0, contribution - annualHousingExpense)
    } else if (!bankrupt) {
      withdrawal = calcWithdrawal(
        params.withdrawal,
        params.initialPortfolio,
        portfolio,
        cumulativeInflation,
      ) * immExpenseMultiplier
      // 退休後房屋支出也從 portfolio 扣除
      withdrawal += annualHousingExpense
    }

    portfolio += contribution

    const weightedReturn = calcWeightedReturn(yearReturns, effectiveAllocation)
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
      immigrationPhase: params.immigrationPlan?.enabled ? immState.phase : undefined,
      activeRegion: params.immigrationPlan?.enabled ? activeRegion : undefined,
      housing: housingSnapshot,
      currentSalary: params.occupationPlan?.enabled ? effectiveIncome : undefined,
      raiseRate: params.occupationPlan?.enabled ? currentRaiseRate : undefined,
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
