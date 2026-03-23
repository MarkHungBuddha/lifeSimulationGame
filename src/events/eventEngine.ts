/**
 * 事件觸發引擎
 *
 * 每年模擬時：
 * 1. 根據年齡查找調整後機率
 * 2. 用 RNG 擲骰子決定觸發
 * 3. 處理事件相關性（經濟衰退 → 股市崩盤 / 裁員）
 * 4. 計算實際財務影響
 */

import { createSeededRNG } from '../engine/rng'
import { EVENT_DATABASE, EVENT_MAP } from './eventDatabase'
import type { RandomEvent, TriggeredEvent, ImpactType } from './eventTypes'

/** 取得年齡調整後的事件機率 */
function getAdjustedProbability(event: RandomEvent, age: number): number {
  if (!event.ageProbabilities || event.ageProbabilities.length === 0) {
    return event.baseProbability
  }
  for (const ap of event.ageProbabilities) {
    if (age >= ap.minAge && age <= ap.maxAge) {
      return ap.probability
    }
  }
  return event.baseProbability
}

/** 計算單一影響的實際金額 */
function calcImpactAmount(
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
        description: `收入永久 +${(value * 100).toFixed(0)}%`,
      }
    case 'savings_boost':
      return {
        amount: portfolio * value,
        description: value >= 0
          ? `儲蓄 +${(value * 100).toFixed(0)}%`
          : `儲蓄 ${(value * 100).toFixed(0)}%（永久）`,
      }
  }
}

/**
 * 擲骰子決定當年觸發的所有事件
 *
 * @param seed       該年的隨機種子
 * @param age        當前年齡
 * @param portfolio  當前資產
 * @param annualIncome 年收入
 * @returns 觸發的事件列表 + 總財務影響
 */
/** 退休後不觸發的事件類別與 ID */
const WORK_ONLY_CATEGORIES: Set<string> = new Set(['career'])
const WORK_ONLY_EVENTS: Set<string> = new Set([
  'layoff', 'pay_cut', 'career_break', 'promotion', 'burnout',
])

export function rollEventsForYear(
  seed: number,
  age: number,
  year: number,
  portfolio: number,
  annualIncome: number,
  isRetired: boolean = false,
): { events: TriggeredEvent[]; totalPortfolioImpact: number; totalIncomeImpact: number; totalExpense: number } {
  const rng = createSeededRNG(seed)
  const triggered: TriggeredEvent[] = []
  const triggeredIds = new Set<string>()

  let totalPortfolioImpact = 0
  let totalIncomeImpact = 0
  let totalExpense = 0

  // 第一輪：獨立觸發
  for (const event of EVENT_DATABASE) {
    // 退休後跳過工作相關事件
    if (isRetired && (WORK_ONLY_CATEGORIES.has(event.category) || WORK_ONLY_EVENTS.has(event.id))) {
      rng() // 消耗 RNG 保持序列一致
      continue
    }
    const prob = getAdjustedProbability(event, age)
    if (rng() < prob) {
      triggeredIds.add(event.id)
    }
  }

  // 第二輪：處理事件相關性（被觸發的事件可能拉動相關事件）
  for (const id of [...triggeredIds]) {
    const event = EVENT_MAP.get(id)!
    if (event.correlatedWith) {
      for (const correlatedId of event.correlatedWith) {
        if (!triggeredIds.has(correlatedId)) {
          // 退休後不拉動工作事件
          const correlated = EVENT_MAP.get(correlatedId)
          if (isRetired && correlated &&
              (WORK_ONLY_CATEGORIES.has(correlated.category) || WORK_ONLY_EVENTS.has(correlated.id))) {
            continue
          }
          // 相關事件有 50% 額外機率被拉動觸發
          if (rng() < 0.5) {
            triggeredIds.add(correlatedId)
          }
        }
      }
    }
  }

  // 計算每個觸發事件的影響
  for (const id of triggeredIds) {
    const event = EVENT_MAP.get(id)!
    const actualImpacts: TriggeredEvent['actualImpacts'] = []

    // 每個事件內，savings_change 和 portfolio_change 只取較大損失（不疊加）
    let eventPortfolioHit = 0
    let eventPortfolioHitPositive = 0

    for (const impact of event.impacts) {
      const { amount, description } = calcImpactAmount(
        impact.type, impact.value, portfolio, annualIncome,
      )
      actualImpacts.push({ type: impact.type, description, amount })

      // savings_change 和 portfolio_change 視為同一池，取最大損失或最大收益
      if (impact.type === 'portfolio_change' || impact.type === 'savings_change') {
        if (amount < 0) eventPortfolioHit = Math.min(eventPortfolioHit, amount)
        else eventPortfolioHitPositive = Math.max(eventPortfolioHitPositive, amount)
      }
      if (impact.type === 'savings_boost') {
        totalPortfolioImpact += amount
      }
      if (impact.type === 'income_change' || impact.type === 'income_boost') {
        totalIncomeImpact += amount
      }
      if (impact.type === 'extra_expense') {
        totalExpense += Math.abs(amount)
      }
    }

    totalPortfolioImpact += eventPortfolioHit + eventPortfolioHitPositive
    triggered.push({ event, age, year, actualImpacts })
  }

  // 年度保護上限：資產損失不超過 -30%，額外支出不超過 3 個月收入
  const maxPortfolioLoss = -portfolio * 0.30
  if (totalPortfolioImpact < maxPortfolioLoss) {
    totalPortfolioImpact = maxPortfolioLoss
  }
  const maxExpense = (annualIncome / 12) * 3
  if (totalExpense > maxExpense) {
    totalExpense = maxExpense
  }

  return { events: triggered, totalPortfolioImpact, totalIncomeImpact, totalExpense }
}
