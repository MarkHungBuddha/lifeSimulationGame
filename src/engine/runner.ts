/**
 * Monte Carlo 批次模擬器
 *
 * 負責執行 N 條路徑並彙總統計結果：
 * - 成功率（未破產比率）
 * - 各年 Percentile（p10/p25/p50/p75/p90）
 * - 中位破產年齡
 */

import { simulatePath, type SimulationParams, type PathResult } from './simulator'
import type { HistoricalData } from './bootstrap'

/** Percentile 資料：每年一組 */
export interface PercentileData {
  p10: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p90: number[]
}

/** 批次模擬結果 */
export interface MonteCarloResult {
  masterSeed: number
  numPaths: number
  successRate: number
  percentiles: PercentileData
  medianFinalPortfolio: number
  medianDepletionAge: number | null
  paths: PathResult[]
}

/** 從排序陣列取 percentile */
function percentile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

/**
 * 執行批次 Monte Carlo 模擬
 *
 * @param data        歷史資料
 * @param params      模擬參數
 * @param numPaths    路徑數（預設 10,000）
 * @param masterSeed  主種子
 * @param onProgress  進度回呼（0~1）
 */
export function runMonteCarlo(
  data: HistoricalData,
  params: SimulationParams,
  numPaths: number = 10000,
  masterSeed: number = Date.now(),
  onProgress?: (progress: number) => void,
): MonteCarloResult {
  const totalYears = params.endAge - params.currentAge
  const paths: PathResult[] = []

  // 執行所有路徑
  for (let i = 0; i < numPaths; i++) {
    const pathSeed = masterSeed + i
    paths.push(simulatePath(data, params, pathSeed))
    if (onProgress && i % 500 === 0) {
      onProgress(i / numPaths)
    }
  }

  // 成功率
  const successCount = paths.filter(p => !p.bankrupt).length
  const successRate = successCount / numPaths

  // 每年的資產值矩陣，計算 percentiles
  const percentiles: PercentileData = {
    p10: [], p25: [], p50: [], p75: [], p90: [],
  }

  for (let y = 0; y < totalYears; y++) {
    const values = paths.map(p => p.snapshots[y].portfolioEnd).sort((a, b) => a - b)
    percentiles.p10.push(percentile(values, 0.10))
    percentiles.p25.push(percentile(values, 0.25))
    percentiles.p50.push(percentile(values, 0.50))
    percentiles.p75.push(percentile(values, 0.75))
    percentiles.p90.push(percentile(values, 0.90))
  }

  // 中位最終資產
  const finalValues = paths.map(p => p.finalPortfolio).sort((a, b) => a - b)
  const medianFinalPortfolio = percentile(finalValues, 0.5)

  // 中位破產年齡
  const bankruptPaths = paths.filter(p => p.bankrupt)
  let medianDepletionAge: number | null = null
  if (bankruptPaths.length > 0) {
    const ages = bankruptPaths.map(p => p.bankruptAge!).sort((a, b) => a - b)
    medianDepletionAge = percentile(ages, 0.5)
  }

  onProgress?.(1)

  return {
    masterSeed,
    numPaths,
    successRate,
    percentiles,
    medianFinalPortfolio,
    medianDepletionAge,
    paths,
  }
}
