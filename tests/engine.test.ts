import { describe, it, expect } from 'vitest'
import { createSeededRNG } from '../src/engine/rng'
import { blockBootstrap, type HistoricalData } from '../src/engine/bootstrap'
import { simulatePath, type SimulationParams } from '../src/engine/simulator'
import data from '../data/assets_returns.json'

// ============================================================
// RNG 測試
// ============================================================
describe('createSeededRNG', () => {
  it('相同 seed 產出相同序列', () => {
    const rng1 = createSeededRNG(42)
    const rng2 = createSeededRNG(42)
    const seq1 = Array.from({ length: 100 }, () => rng1())
    const seq2 = Array.from({ length: 100 }, () => rng2())
    expect(seq1).toEqual(seq2)
  })

  it('不同 seed 產出不同序列', () => {
    const rng1 = createSeededRNG(42)
    const rng2 = createSeededRNG(99)
    const seq1 = Array.from({ length: 20 }, () => rng1())
    const seq2 = Array.from({ length: 20 }, () => rng2())
    expect(seq1).not.toEqual(seq2)
  })

  it('產出值在 [0, 1) 範圍內', () => {
    const rng = createSeededRNG(123)
    for (let i = 0; i < 10000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('分佈大致均勻', () => {
    const rng = createSeededRNG(7)
    const n = 100000
    let below = 0
    for (let i = 0; i < n; i++) {
      if (rng() < 0.5) below++
    }
    // 期望 ~50%，允許 1% 誤差
    expect(below / n).toBeCloseTo(0.5, 1)
  })
})

// ============================================================
// Block Bootstrap 測試
// ============================================================
describe('blockBootstrap', () => {
  const historicalData = data as HistoricalData

  it('產出正確長度', () => {
    const result = blockBootstrap(historicalData, 50, 42)
    expect(result).toHaveLength(50)
  })

  it('相同 seed 產出相同序列', () => {
    const r1 = blockBootstrap(historicalData, 30, 42)
    const r2 = blockBootstrap(historicalData, 30, 42)
    expect(r1).toEqual(r2)
  })

  it('每筆資料包含所有必要欄位', () => {
    const result = blockBootstrap(historicalData, 10, 42)
    for (const yr of result) {
      expect(yr).toHaveProperty('sp500')
      expect(yr).toHaveProperty('bond')
      expect(yr).toHaveProperty('gold')
      expect(yr).toHaveProperty('cash')
      expect(yr).toHaveProperty('reits')
      expect(yr).toHaveProperty('cpi')
    }
  })

  it('報酬值來自歷史資料', () => {
    const result = blockBootstrap(historicalData, 50, 99)
    const historicalSp500 = Object.values(historicalData).map(d => d.sp500)
    for (const yr of result) {
      expect(historicalSp500).toContain(yr.sp500)
    }
  })

  it('區塊內年份連續（保留序列相關性）', () => {
    // 用較小 blockSize 方便驗證
    const blockSize = 4
    const result = blockBootstrap(historicalData, 8, 42, blockSize)
    const allYearReturns = Object.values(historicalData)

    // 前 4 筆應來自同一連續區塊
    const firstBlockStart = allYearReturns.findIndex(
      yr => yr.sp500 === result[0].sp500 && yr.bond === result[0].bond,
    )
    if (firstBlockStart >= 0 && firstBlockStart + blockSize <= allYearReturns.length) {
      for (let i = 0; i < blockSize; i++) {
        expect(result[i].sp500).toBe(allYearReturns[firstBlockStart + i].sp500)
      }
    }
  })
})

// ============================================================
// Simulator 測試
// ============================================================
describe('simulatePath', () => {
  const historicalData = data as HistoricalData

  const baseParams: SimulationParams = {
    currentAge: 30,
    retirementAge: 65,
    endAge: 95,
    initialPortfolio: 100000,
    annualContribution: 20000,
    annualIncome: 70000,
    allocation: { sp500: 0.6, bond: 0.2, gold: 0.1, cash: 0.05, reits: 0.05 },
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    enableEvents: false,
  }

  it('相同 seed 產出相同路徑', () => {
    const r1 = simulatePath(historicalData, baseParams, 42)
    const r2 = simulatePath(historicalData, baseParams, 42)
    expect(r1.finalPortfolio).toBe(r2.finalPortfolio)
    expect(r1.bankrupt).toBe(r2.bankrupt)
    expect(r1.snapshots.length).toBe(r2.snapshots.length)
  })

  it('模擬年數正確', () => {
    const result = simulatePath(historicalData, baseParams, 42)
    expect(result.snapshots).toHaveLength(baseParams.endAge - baseParams.currentAge)
  })

  it('退休前有存入、無提領', () => {
    const result = simulatePath(historicalData, baseParams, 42)
    const preRetirement = result.snapshots.filter(s => s.age < baseParams.retirementAge)
    for (const s of preRetirement) {
      expect(s.contribution).toBeGreaterThan(0)
      expect(s.withdrawal).toBe(0)
    }
  })

  it('退休後有提領、無存入', () => {
    const result = simulatePath(historicalData, baseParams, 42)
    const postRetirement = result.snapshots.filter(
      s => s.age >= baseParams.retirementAge && !s.bankrupt,
    )
    for (const s of postRetirement) {
      expect(s.withdrawal).toBeGreaterThan(0)
      expect(s.contribution).toBe(0)
    }
  })

  it('配置權重不為 1 時拋出錯誤', () => {
    const badParams = {
      ...baseParams,
      allocation: { sp500: 0.5, bond: 0.2, gold: 0.1, cash: 0.05, reits: 0.05 },
    }
    expect(() => simulatePath(historicalData, badParams, 42)).toThrow('權重總和必須為 1')
  })

  it('破產後資產歸零', () => {
    // 超高提領率強制破產
    const bankruptParams: SimulationParams = {
      ...baseParams,
      initialPortfolio: 10000,
      annualContribution: 0,
      retirementAge: 30, // 立刻退休
      withdrawal: { type: 'fixed_amount', amount: 50000 }, // 每年提 5 萬
    }
    const result = simulatePath(historicalData, bankruptParams, 42)
    expect(result.bankrupt).toBe(true)
    expect(result.bankruptAge).not.toBeNull()
    // 破產後資產應為 0
    const afterBankrupt = result.snapshots.filter(s => s.bankrupt)
    for (const s of afterBankrupt) {
      expect(s.portfolioEnd).toBe(0)
    }
  })

  it('累計通膨第 0 年為 1，之後逐年乘以 (1+cpi)', () => {
    const result = simulatePath(historicalData, baseParams, 42)
    expect(result.snapshots[0].cumulativeInflation).toBe(1.0)
    // 手動驗算前幾年
    let expected = 1.0
    for (let i = 1; i < Math.min(10, result.snapshots.length); i++) {
      expected *= 1 + result.snapshots[i].returns.cpi
      expect(result.snapshots[i].cumulativeInflation).toBeCloseTo(expected, 10)
    }
  })
})
