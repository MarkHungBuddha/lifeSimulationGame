/**
 * 事件觸發引擎
 *
 * 每年模擬時：
 * 1. 根據年齡查找調整後機率
 * 2. 用 RNG 擲骰子決定觸發
 * 3. 處理事件相關性（經濟衰退 → 股市崩盤 / 裁員）
 * 4. 計算實際財務影響
 * 5. 根據是否有房調整事件觸發條件與影響
 */

import { createSeededRNG } from '../engine/rng'
import { EVENT_DATABASE, EVENT_MAP } from './eventDatabase'
import { EVENT_DATABASE_TW, EVENT_MAP_TW } from './eventDatabase_tw'
import { EVENT_DATABASE_JP, EVENT_MAP_JP } from './eventDatabase_jp'
import type { RandomEvent, TriggeredEvent, ImpactType } from './eventTypes'
import type { Region } from '../config/regions'

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

/** 退休後不觸發的事件類別與 ID */
const WORK_ONLY_CATEGORIES: Set<string> = new Set(['career'])
const WORK_ONLY_EVENTS: Set<string> = new Set([
  // US
  'layoff', 'pay_cut', 'career_break', 'promotion', 'burnout',
  // TW
  'tw_layoff', 'tw_unpaid_leave', 'tw_career_break', 'tw_promotion',
  'tw_job_hop', 'tw_burnout', 'tw_company_bankrupt',
  // JP
  'jp_layoff', 'jp_early_retirement', 'jp_job_change', 'jp_promotion',
  'jp_bonus_cut', 'jp_burnout', 'jp_non_regular', 'jp_company_bankrupt',
  'jp_karoshi_health',
])

/** 當購屋模組啟用時，跳過這些事件（避免重複計算） */
const HOUSING_MODULE_SKIP: Set<string> = new Set([
  'tw_purchase_home', 'jp_purchase_home',
])

/** 取得地區對應的事件資料 */
function getEventData(region: Region) {
  if (region === 'tw') return { database: EVENT_DATABASE_TW, map: EVENT_MAP_TW }
  if (region === 'jp') return { database: EVENT_DATABASE_JP, map: EVENT_MAP_JP }
  return { database: EVENT_DATABASE, map: EVENT_MAP }
}

/** rollEventsForYear 參數 */
export interface EventRollParams {
  seed: number
  age: number
  year: number
  portfolio: number
  annualIncome: number
  isRetired?: boolean
  region?: Region
  ownsHome?: boolean
  housingModuleEnabled?: boolean
  occupationId?: number
}

/**
 * 擲骰子決定當年觸發的所有事件
 *
 * @param params     事件擲骰參數
 * @returns 觸發的事件列表 + 總財務影響
 */
export function rollEventsForYear(
  params: EventRollParams,
): { events: TriggeredEvent[]; totalPortfolioImpact: number; totalIncomeImpact: number; totalExpense: number } {
  const {
    seed, age, year, portfolio, annualIncome,
    isRetired = false, region = 'us', ownsHome = false,
    housingModuleEnabled = false, occupationId = 0,
  } = params
  const { database, map } = getEventData(region)
  const rng = createSeededRNG(seed)
  const triggered: TriggeredEvent[] = []
  const triggeredIds = new Set<string>()

  let totalPortfolioImpact = 0
  let totalIncomeImpact = 0
  let totalExpense = 0

  // 第一輪：獨立觸發
  for (const event of database) {
    // 退休後跳過工作相關事件
    if (isRetired && (WORK_ONLY_CATEGORIES.has(event.category) || WORK_ONLY_EVENTS.has(event.id))) {
      rng() // 消耗 RNG 保持序列一致
      continue
    }
    // 購屋模組啟用時跳過購屋隨機事件（避免重複）
    if (housingModuleEnabled && HOUSING_MODULE_SKIP.has(event.id)) {
      rng() // 消耗 RNG 保持序列一致
      continue
    }
    // 購屋條件篩選
    if (event.housingCondition === 'owner_only' && !ownsHome) {
      rng() // 消耗 RNG 保持序列一致
      continue
    }
    if (event.housingCondition === 'renter_only' && ownsHome) {
      rng() // 消耗 RNG 保持序列一致
      continue
    }
    // 職業篩選
    if (event.occupationIds && event.occupationIds.length > 0) {
      if (occupationId === 0 || !event.occupationIds.includes(occupationId)) {
        rng() // 消耗 RNG 保持序列一致
        continue
      }
    }

    let prob = getAdjustedProbability(event, age)
    // 有房者機率倍數調整
    if (ownsHome && event.ownerProbabilityMultiplier) {
      prob *= event.ownerProbabilityMultiplier
    }
    // 職業機率倍數調整
    const occMod = event.occupationModifiers?.[occupationId]
    if (occMod?.probabilityMultiplier) {
      prob *= occMod.probabilityMultiplier
    }

    if (rng() < prob) {
      triggeredIds.add(event.id)
    }
  }

  // 第二輪：處理事件相關性（被觸發的事件可能拉動相關事件）
  for (const id of [...triggeredIds]) {
    const event = map.get(id)!
    if (event.correlatedWith) {
      for (const correlatedId of event.correlatedWith) {
        if (!triggeredIds.has(correlatedId)) {
          const correlated = map.get(correlatedId)
          if (!correlated) continue
          // 退休後不拉動工作事件
          if (isRetired &&
              (WORK_ONLY_CATEGORIES.has(correlated.category) || WORK_ONLY_EVENTS.has(correlated.id))) {
            continue
          }
          // 購屋模組啟用時不拉動購屋事件
          if (housingModuleEnabled && HOUSING_MODULE_SKIP.has(correlatedId)) {
            continue
          }
          // 購屋條件篩選
          if (correlated.housingCondition === 'owner_only' && !ownsHome) continue
          if (correlated.housingCondition === 'renter_only' && ownsHome) continue

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
    const event = map.get(id)!
    const actualImpacts: TriggeredEvent['actualImpacts'] = []
    const occMod2 = event.occupationModifiers?.[occupationId]
    const impactMult = occMod2?.impactMultiplier ?? 1.0

    // 每個事件內，savings_change 和 portfolio_change 只取較大損失（不疊加）
    let eventPortfolioHit = 0
    let eventPortfolioHitPositive = 0

    // 合併基礎影響 + 有房者額外影響
    const allImpacts = ownsHome && event.ownerExtraImpacts
      ? [...event.impacts, ...event.ownerExtraImpacts]
      : event.impacts

    for (const impact of allImpacts) {
      // 職業影響倍率：僅作用於 income_change / extra_expense / savings_change
      const shouldApplyMult = impact.type === 'income_change'
        || impact.type === 'extra_expense'
        || impact.type === 'savings_change'
      const effectiveValue = shouldApplyMult ? impact.value * impactMult : impact.value
      const { amount, description } = calcImpactAmount(
        impact.type, effectiveValue, portfolio, annualIncome,
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
    triggered.push({
      event, age, year, actualImpacts,
      displayName: occMod2?.name,
      displayDescription: occMod2?.description,
    })
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
