/**
 * 單條路徑模擬器
 *
 * 模擬邏輯（每年）：
 * 1. Block Bootstrap 抽出該年各資產報酬
 * 2. 依玩家資產配置計算加權報酬
 * 3. 資產成長：portfolio *= (1 + weightedReturn)
 * 4. 扣除提領金額（通膨調整後）
 * 5. 檢查破產（資產 ≤ 0）
 */

import { blockBootstrap, type HistoricalData, type YearReturns } from './bootstrap'

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
  | { type: 'fixed_rate'; rate: number }        // 如 4% 法則：每年提領初始資產的 rate%（通膨調整）
  | { type: 'fixed_amount'; amount: number }     // 固定金額（通膨調整）
  | { type: 'dynamic'; floor: number; ceiling: number } // 動態：依當年資產 rate%，但有上下限

/** 模擬參數 */
export interface SimulationParams {
  currentAge: number
  retirementAge: number
  endAge: number            // 模擬結束年齡（如 95 歲）
  initialPortfolio: number  // 起始資產（美元）
  annualContribution: number // 退休前每年存入金額
  allocation: Allocation
  withdrawal: WithdrawalStrategy
}

/** 單年模擬快照 */
export interface YearSnapshot {
  age: number
  year: number               // 模擬第幾年（0-based）
  portfolioStart: number     // 年初資產
  returns: YearReturns       // 該年抽到的報酬
  weightedReturn: number     // 加權報酬率
  withdrawal: number         // 該年實際提領金額
  contribution: number       // 該年存入金額
  portfolioEnd: number       // 年末資產
  cumulativeInflation: number // 累計通膨倍數
  bankrupt: boolean
}

/** 單條路徑結果 */
export interface PathResult {
  seed: number
  snapshots: YearSnapshot[]
  finalPortfolio: number
  bankrupt: boolean
  bankruptAge: number | null
}

const ASSET_KEYS: (keyof Allocation)[] = ['sp500', 'bond', 'gold', 'cash', 'reits']

/** 驗證配置權重總和為 1 */
function validateAllocation(alloc: Allocation): void {
  const sum = ASSET_KEYS.reduce((s, k) => s + alloc[k], 0)
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(`資產配置權重總和必須為 1，目前為 ${sum.toFixed(4)}`)
  }
}

/** 計算加權報酬率 */
function calcWeightedReturn(returns: YearReturns, alloc: Allocation): number {
  return ASSET_KEYS.reduce((sum, key) => sum + alloc[key] * returns[key], 0)
}

/** 計算該年提領金額 */
function calcWithdrawal(
  strategy: WithdrawalStrategy,
  initialPortfolio: number,
  currentPortfolio: number,
  cumulativeInflation: number,
): number {
  switch (strategy.type) {
    case 'fixed_rate':
      // 4% 法則：第一年提領 initialPortfolio * rate，之後通膨調整
      return initialPortfolio * strategy.rate * cumulativeInflation

    case 'fixed_amount':
      // 固定金額，通膨調整
      return strategy.amount * cumulativeInflation

    case 'dynamic': {
      // 動態提領：取當前資產的某比例，但限制在 floor ~ ceiling（通膨調整後）
      const base = currentPortfolio * 0.04 // 基礎 4% 當前資產
      const floor = strategy.floor * cumulativeInflation
      const ceiling = strategy.ceiling * cumulativeInflation
      return Math.max(floor, Math.min(ceiling, base))
    }
  }
}

/**
 * 模擬單條路徑
 *
 * @param data    歷史資料
 * @param params  模擬參數
 * @param seed    該路徑的隨機種子
 * @returns       完整路徑結果
 */
export function simulatePath(
  data: HistoricalData,
  params: SimulationParams,
  seed: number,
): PathResult {
  validateAllocation(params.allocation)

  const totalYears = params.endAge - params.currentAge
  const yearsToRetirement = params.retirementAge - params.currentAge

  // 一次抽出整條路徑所需的報酬序列
  const returnSequence = blockBootstrap(data, totalYears, seed)

  let portfolio = params.initialPortfolio
  let cumulativeInflation = 1.0
  let bankrupt = false
  let bankruptAge: number | null = null
  const snapshots: YearSnapshot[] = []

  for (let y = 0; y < totalYears; y++) {
    const age = params.currentAge + y
    const yearReturns = returnSequence[y]
    const portfolioStart = portfolio

    // 累計通膨（第 0 年為 1.0，第 1 年起開始累計）
    if (y > 0) {
      cumulativeInflation *= 1 + yearReturns.cpi
    }

    // 退休前：存入；退休後：提領
    const isRetired = age >= params.retirementAge
    let contribution = 0
    let withdrawal = 0

    if (!isRetired) {
      contribution = params.annualContribution * cumulativeInflation
    } else if (!bankrupt) {
      withdrawal = calcWithdrawal(
        params.withdrawal,
        params.initialPortfolio,
        portfolio,
        cumulativeInflation,
      )
    }

    // 年初加入存款
    portfolio += contribution

    // 資產成長
    const weightedReturn = calcWeightedReturn(yearReturns, params.allocation)
    portfolio *= 1 + weightedReturn

    // 扣除提領
    portfolio -= withdrawal

    // 破產檢查
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
    })
  }

  return {
    seed,
    snapshots,
    finalPortfolio: portfolio,
    bankrupt,
    bankruptAge,
  }
}
