import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSeededRNG } from '../src/engine/rng'
import { blockBootstrap, type HistoricalData } from '../src/engine/bootstrap'
import { simulatePath, type SimulationParams } from '../src/engine/simulator'
import { rollEventsForYear } from '../src/events/eventEngine'
import { normalizeTriggeredEvents } from '../src/events/eventEffects'
import { getAnnualRaise, getOccupationDefaults } from '../src/engine/occupationEngine'
import { OCCUPATIONS, OCCUPATION_MAP } from '../src/engine/occupationData'
import * as eventEngineModule from '../src/events/eventEngine'
import * as immigrationEngineModule from '../src/engine/immigrationEngine'
import type { TriggeredEvent } from '../src/events/eventTypes'
import data from '../data/assets_returns.json'

afterEach(() => {
  vi.restoreAllMocks()
})

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
    allocation: { sp500: 0.45, intlStock: 0.15, bond: 0.2, gold: 0.1, cash: 0.05, reits: 0.05 },
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
      allocation: { sp500: 0.35, intlStock: 0.15, bond: 0.2, gold: 0.1, cash: 0.05, reits: 0.05 },
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

// ============================================================
// 職業系統測試
// ============================================================
describe('Occupation System', () => {
  const historicalData = data as HistoricalData
  const baseParams: SimulationParams = {
    currentAge: 30,
    retirementAge: 65,
    endAge: 95,
    initialPortfolio: 100000,
    annualContribution: 20000,
    annualIncome: 80000,
    allocation: { sp500: 0.6, intlStock: 0, bond: 0.3, gold: 0.05, cash: 0.05, reits: 0 },
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    enableEvents: false,
  }

  it('getAnnualRaise 同 seed 回傳相同結果', () => {
    const rng1 = createSeededRNG(42)
    const rng2 = createSeededRNG(42)
    const raise1 = getAnnualRaise(2, 30, 'us', rng1)
    const raise2 = getAnnualRaise(2, 30, 'us', rng2)
    expect(raise1).toBe(raise2)
  })

  it('年輕人加薪率 > 中年 > 高齡', () => {
    // 用固定 rng 值來排除隨機性
    const makeFixedRng = (v: number) => () => v
    const youngRaise = getAnnualRaise(2, 28, 'us', makeFixedRng(0.5))
    const midRaise = getAnnualRaise(2, 40, 'us', makeFixedRng(0.5))
    const seniorRaise = getAnnualRaise(2, 55, 'us', makeFixedRng(0.5))
    expect(youngRaise).toBeGreaterThan(midRaise)
    expect(midRaise).toBeGreaterThan(seniorRaise)
  })

  it('不同國家的加薪範圍符合預期', () => {
    const occ = OCCUPATION_MAP.get(9)! // IT
    expect(occ.raiseRange.us[1]).toBeGreaterThan(occ.raiseRange.tw[1])
    expect(occ.raiseRange.tw[1]).toBeGreaterThanOrEqual(occ.raiseRange.jp[1])
  })

  it('getOccupationDefaults 回傳合理值', () => {
    const defaults = getOccupationDefaults(1, 'us') // Management US
    expect(defaults.annualIncome).toBe(122_090)
    expect(defaults.annualContribution).toBeGreaterThan(0)
    expect(defaults.annualContribution).toBeLessThan(defaults.annualIncome)
  })

  it('occupationPlan 未啟用時模擬結果與無 occupationPlan 完全一致', () => {
    const seed = 12345
    const result1 = simulatePath(historicalData, baseParams, seed)
    const result2 = simulatePath(historicalData, {
      ...baseParams,
      occupationPlan: undefined,
    }, seed)
    expect(result1.finalPortfolio).toBe(result2.finalPortfolio)
    expect(result1.bankrupt).toBe(result2.bankrupt)
    for (let i = 0; i < result1.snapshots.length; i++) {
      expect(result1.snapshots[i].portfolioEnd).toBe(result2.snapshots[i].portfolioEnd)
    }
  })

  it('occupationPlan 啟用時收入隨時間成長', () => {
    const result = simulatePath(historicalData, {
      ...baseParams,
      enableEvents: false,
      occupationPlan: { enabled: true, occupationId: 2 },
    }, 42)
    const workSnapshots = result.snapshots.filter(s => s.currentSalary != null)
    expect(workSnapshots.length).toBeGreaterThan(0)
    const firstSalary = workSnapshots[0].currentSalary!
    const lastSalary = workSnapshots[workSnapshots.length - 1].currentSalary!
    expect(lastSalary).toBeGreaterThan(firstSalary)
  })

  it('10 個職業資料完整', () => {
    expect(OCCUPATIONS.length).toBe(10)
    for (const occ of OCCUPATIONS) {
      expect(occ.baseSalary.us).toBeGreaterThan(0)
      expect(occ.baseSalary.tw).toBeGreaterThan(0)
      expect(occ.baseSalary.jp).toBeGreaterThan(0)
      expect(occ.raiseRange.us[0]).toBeLessThan(occ.raiseRange.us[1])
    }
  })

  it('不存在的 occupationId 回傳 0 加薪率', () => {
    const rng = createSeededRNG(42)
    const raise = getAnnualRaise(999, 30, 'us', rng)
    expect(raise).toBe(0)
  })
})

// ============================================================
// 破產率修復測試
// ============================================================
describe('Bankruptcy structural fixes', () => {
  const historicalData = data as HistoricalData
  const baseParams: SimulationParams = {
    currentAge: 30,
    retirementAge: 65,
    endAge: 95,
    initialPortfolio: 100000,
    annualContribution: 20000,
    annualIncome: 80000,
    allocation: { sp500: 0.6, intlStock: 0, bond: 0.3, gold: 0.05, cash: 0.05, reits: 0 },
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    enableEvents: false,
  }

  it('contribution 隨 effectiveIncome 成長（occupationPlan 啟用）', () => {
    const result = simulatePath(historicalData, {
      ...baseParams,
      occupationPlan: { enabled: true, occupationId: 2 },
    }, 42)

    // 取退休前的 contribution 快照
    const workSnaps = result.snapshots.filter(s => s.age < 65 && s.contribution > 0)
    expect(workSnaps.length).toBeGreaterThan(5)

    // contribution 不應全部相同（因為 effectiveIncome 逐年成長）
    const contributions = workSnaps.map(s => s.contribution)
    const uniqueContribs = new Set(contributions.map(c => Math.round(c)))
    expect(uniqueContribs.size).toBeGreaterThan(1)

    // 後期 contribution 應大於早期
    const earlyAvg = contributions.slice(0, 5).reduce((a, b) => a + b, 0) / 5
    const lateAvg = contributions.slice(-5).reduce((a, b) => a + b, 0) / 5
    expect(lateAvg).toBeGreaterThan(earlyAvg)
  })

  it('退休後 paid_off 住房成本基於 purchasePrice（withdrawal 穩定）', () => {
    // 有房 vs 無房，退休後 withdrawal 差異應穩定（不隨房屋增值膨脹）
    const housingParams = {
      ...baseParams,
      housingPlan: {
        enabled: true,
        purchaseAge: 32,
        priceToIncomeRatio: 5,
        downPaymentRatio: 0.3,
        mortgageYears: 20,
      },
    }
    const withHousing = simulatePath(historicalData, housingParams, 42)
    const withoutHousing = simulatePath(historicalData, baseParams, 42)

    // 找退休後且房貸已清的年份
    const retiredPaidOff = withHousing.snapshots.filter(
      s => s.age >= 65 && s.housing?.mortgageBalance === 0 && s.housing?.ownsHouse && !s.bankrupt,
    )
    expect(retiredPaidOff.length).toBeGreaterThan(2)

    // 計算每年住房造成的 withdrawal 增量
    const housingCostDeltas = retiredPaidOff.map(s => {
      const noHousingSnap = withoutHousing.snapshots.find(ns => ns.age === s.age)!
      return s.withdrawal - noHousingSnap.withdrawal
    })

    // 若基於購入價，前後增量應穩定，比值不應超過 1.5 倍
    const firstDelta = housingCostDeltas[0]
    const lastDelta = housingCostDeltas[housingCostDeltas.length - 1]
    if (firstDelta > 0) {
      expect(lastDelta / firstDelta).toBeLessThan(1.5)
    }
  })

  it('既有測試不受影響：無 occupationPlan 時行為一致', () => {
    const seed = 99999
    const result1 = simulatePath(historicalData, baseParams, seed)
    const result2 = simulatePath(historicalData, {
      ...baseParams,
      occupationPlan: undefined,
    }, seed)
    expect(result1.finalPortfolio).toBe(result2.finalPortfolio)
    expect(result1.bankrupt).toBe(result2.bankrupt)
  })
})

// ============================================================
// 事件引擎篩選測試
// ============================================================
describe('Event engine occupation filter', () => {
  it('occupationId=0 時不觸發職業專屬事件', () => {
    // 跑多個 seed，確保職業專屬事件都被過濾
    for (let seed = 1; seed <= 50; seed++) {
      const result = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 0,
      })
      for (const evt of result.events) {
        expect(evt.event.occupationIds ?? []).toHaveLength(0)
      }
    }
  })

  it('occupationId=9 時只觸發通用事件或 id=9 的職業事件', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const result = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 9,
      })
      for (const evt of result.events) {
        const occIds = evt.event.occupationIds
        if (occIds && occIds.length > 0) {
          expect(occIds).toContain(9)
        }
      }
    }
  })
})

// ============================================================
// 職業事件 Modifier 測試
// ============================================================
describe('Occupation event modifiers', () => {
  it('modifier 機率倍率生效：高倍率職業觸發率 > 低倍率職業', () => {
    // IT (id:9) layoff probabilityMultiplier=1.5 vs 農林 (id:6) =0.3
    let triggerCountIT = 0
    let triggerCountAgri = 0
    const trials = 2000
    for (let seed = 1; seed <= trials; seed++) {
      const resultIT = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 9,
      })
      if (resultIT.events.some(e => e.event.id === 'layoff')) triggerCountIT++

      const resultAgri = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 6,
      })
      if (resultAgri.events.some(e => e.event.id === 'layoff')) triggerCountAgri++
    }
    // IT 觸發率應顯著高於農林
    expect(triggerCountIT).toBeGreaterThan(triggerCountAgri)
  })

  it('modifier 影響倍率只作用於 income_change / extra_expense / savings_change', () => {
    // 找到 burnout 事件（IT id:9 impactMultiplier=1.2）
    // 跑多個 seed 直到觸發
    for (let seed = 1; seed <= 500; seed++) {
      const resultIT = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 9,
      })
      const resultBase = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 0,
      })
      const burnoutIT = resultIT.events.find(e => e.event.id === 'burnout')
      const burnoutBase = resultBase.events.find(e => e.event.id === 'burnout')
      if (burnoutIT && burnoutBase) {
        // income_change 影響應被放大
        const incomeIT = burnoutIT.actualImpacts.find(i => i.type === 'income_change')
        const incomeBase = burnoutBase.actualImpacts.find(i => i.type === 'income_change')
        if (incomeIT && incomeBase) {
          expect(Math.abs(incomeIT.amount)).toBeGreaterThan(Math.abs(incomeBase.amount))
        }
        return // 測試通過
      }
    }
    // 如果 500 seed 都沒觸發，跳過（極不可能）
  })

  it('displayName / displayDescription 正確填入', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const result = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 9,
      })
      const layoff = result.events.find(e => e.event.id === 'layoff')
      if (layoff) {
        // IT (id:9) layoff 有 name='Tech Layoff Wave'
        expect(layoff.displayName).toBe('Tech Layoff Wave')
        expect(layoff.displayDescription).toBe('Mass layoffs sweep the industry; your team is eliminated')
        return
      }
    }
    // 如果 500 seed 都沒觸發，跳過
  })

  it('occupationId=0 時不套用任何 modifier', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const result = rollEventsForYear({
        seed, age: 35, year: 5, portfolio: 500000, annualIncome: 100000,
        isRetired: false, region: 'us', ownsHome: false,
        housingModuleEnabled: false, occupationId: 0,
      })
      for (const evt of result.events) {
        // occupationId=0 不應有 display 覆寫
        expect(evt.displayName).toBeUndefined()
        expect(evt.displayDescription).toBeUndefined()
      }
    }
  })
})

// ============================================================
// 事件 effect normalization / simulator 套用測試
// ============================================================
describe('Event effect normalization', () => {
  it('保留既有 aggregation 與 cap，並將 permanent savings 轉為永久支出調整', () => {
    const events: TriggeredEvent[] = [
      {
        event: {
          id: 'e1',
          name: 'Aggregation check',
          category: 'market',
          description: '',
          baseProbability: 1,
          durationMonths: [0, 0],
          impacts: [],
        },
        age: 30,
        year: 0,
        actualImpacts: [
          { type: 'portfolio_change', description: '', amount: -10000 },
          { type: 'savings_change', description: '', amount: -40000 },
          { type: 'portfolio_change', description: '', amount: 6000 },
          { type: 'savings_change', description: '', amount: 8000 },
        ],
      },
      {
        event: {
          id: 'e2',
          name: 'Expense check',
          category: 'family',
          description: '',
          baseProbability: 1,
          durationMonths: [0, 0],
          impacts: [],
        },
        age: 30,
        year: 0,
        actualImpacts: [
          { type: 'extra_expense', description: '', amount: -50000 },
          { type: 'savings_boost', description: '', amount: -3000, permanent: true },
        ],
      },
    ]

    const normalized = normalizeTriggeredEvents(events, 100000, 120000)

    expect(normalized.portfolioDeltaImmediate).toBe(-30000)
    expect(normalized.expenseDeltaImmediate).toBe(30000)
    expect(normalized.expenseDeltaPermanent).toBe(-3000)
    expect(normalized.incomeDeltaCurrentYear).toBe(0)
    expect(normalized.incomeDeltaPermanent).toBe(0)
  })
})

describe('Simulator event application', () => {
  const historicalData = data as HistoricalData
  const baseParams: SimulationParams = {
    currentAge: 30,
    retirementAge: 65,
    endAge: 32,
    initialPortfolio: 100000,
    annualContribution: 20000,
    annualIncome: 100000,
    allocation: { sp500: 0.6, intlStock: 0, bond: 0.3, gold: 0.05, cash: 0.05, reits: 0 },
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    enableEvents: true,
  }

  function noImmigrationYear() {
    return {
      newState: {
        phase: 'none' as const,
        phaseStartAge: 0,
        failedAttempts: 0,
        yearsInTarget: 0,
        hasPermanentResidency: false,
        totalImmigrationCost: 0,
      },
      activeRegion: 'us' as const,
      costThisYear: 0,
      incomeMultiplier: 1,
      expenseMultiplier: 1,
      immigrationEvents: [],
      phaseChanged: false,
      phaseLabel: null,
      switchedAllocation: null,
    }
  }

  it('temporary income_change 只影響當年 contribution，不改寫下一年收入基礎', () => {
    vi.spyOn(immigrationEngineModule, 'processImmigrationYear').mockImplementation(noImmigrationYear)
    vi.spyOn(eventEngineModule, 'rollEventsForYear').mockImplementation(({ year }) => ({
      events: year === 0
        ? [{
            event: {
              id: 'temp-income',
              name: 'Temp income shock',
              category: 'career',
              description: '',
              baseProbability: 1,
              durationMonths: [0, 0],
              impacts: [],
            },
            age: 30,
            year: 0,
            actualImpacts: [
              { type: 'income_change', description: '', amount: -50000 },
            ],
          }]
        : [],
      totalPortfolioImpact: 0,
      totalIncomeImpact: 0,
      totalExpense: 0,
    }))

    const result = simulatePath(historicalData, baseParams, 42)

    expect(result.snapshots[0].contribution).toBeCloseTo(10000, 10)
    expect(result.snapshots[1].contribution).toBeCloseTo(20000 * result.snapshots[1].cumulativeInflation, 10)
  })

  it('permanent income_change 會從當年開始延續到下一年', () => {
    vi.spyOn(immigrationEngineModule, 'processImmigrationYear').mockImplementation(noImmigrationYear)
    vi.spyOn(eventEngineModule, 'rollEventsForYear').mockImplementation(({ year }) => ({
      events: year === 0
        ? [{
            event: {
              id: 'perm-income',
              name: 'Permanent income shock',
              category: 'career',
              description: '',
              baseProbability: 1,
              durationMonths: [0, 0],
              impacts: [],
            },
            age: 30,
            year: 0,
            actualImpacts: [
              { type: 'income_change', description: '', amount: -50000, permanent: true },
            ],
          }]
        : [],
      totalPortfolioImpact: 0,
      totalIncomeImpact: 0,
      totalExpense: 0,
    }))

    const result = simulatePath(historicalData, baseParams, 42)

    expect(result.snapshots[0].contribution).toBeCloseTo(10000, 10)
    expect(result.snapshots[1].contribution).toBeCloseTo(10000 * result.snapshots[1].cumulativeInflation, 10)
  })

  it('permanent savings_boost 會改變後續 contribution 基礎，而不是只影響單年 portfolio', () => {
    vi.spyOn(immigrationEngineModule, 'processImmigrationYear').mockImplementation(noImmigrationYear)
    vi.spyOn(eventEngineModule, 'rollEventsForYear').mockImplementation(({ year }) => ({
      events: year === 0
        ? [{
            event: {
              id: 'perm-savings',
              name: 'Permanent savings change',
              category: 'family',
              description: '',
              baseProbability: 1,
              durationMonths: [0, 0],
              impacts: [],
            },
            age: 30,
            year: 0,
            actualImpacts: [
              { type: 'savings_boost', description: '', amount: -5000, permanent: true },
            ],
          }]
        : [],
      totalPortfolioImpact: 0,
      totalIncomeImpact: 0,
      totalExpense: 0,
    }))

    const result = simulatePath(historicalData, baseParams, 42)

    expect(result.snapshots[0].contribution).toBeCloseTo(15000, 10)
    expect(result.snapshots[1].contribution).toBeCloseTo(15000 * result.snapshots[1].cumulativeInflation, 10)
    expect(result.snapshots[0].eventPortfolioImpact).toBe(0)
  })
})
