/**
 * 職業引擎
 *
 * 提供薪資成長計算和職業預設值查詢。
 * 加薪邏輯：baseSalary × raiseRange 均勻抽樣 × 年齡修正係數
 */

import type { Region } from '../config/regions'
import { OCCUPATION_MAP } from './occupationData'

/**
 * 計算該年度的加薪率
 *
 * 1. 從 OccupationDef.raiseRange[region] 取 [min, max]
 * 2. 用 rng() 在 [min, max] 均勻抽樣得到 baseRaise
 * 3. 乘以年齡修正係數：
 *    - age < 35: youngBoost (年輕時加薪快)
 *    - 35 ≤ age < 50: midFactor
 *    - age ≥ 50: seniorFactor (趨緩)
 * 4. 回傳最終加薪率（不可為負）
 */
export function getAnnualRaise(
  occupationId: number,
  age: number,
  region: Region,
  rng: () => number,
): number {
  const occ = OCCUPATION_MAP.get(occupationId)
  if (!occ) return 0

  const [min, max] = occ.raiseRange[region]
  const baseRaise = min + rng() * (max - min)

  const { youngBoost, midFactor, seniorFactor } = occ.ageRaiseFactor
  const ageFactor = age < 35 ? youngBoost : age < 50 ? midFactor : seniorFactor

  return Math.max(0, baseRaise * ageFactor)
}

/**
 * 根據職業+國家取得預設年收入和年投資額
 * 用於 gameStore 中切換職業時自動填入
 */
export function getOccupationDefaults(
  occupationId: number,
  region: Region,
): { annualIncome: number; annualContribution: number } {
  const occ = OCCUPATION_MAP.get(occupationId)
  if (!occ) {
    return { annualIncome: 0, annualContribution: 0 }
  }

  const annualIncome = occ.baseSalary[region]

  // 儲蓄率依國家差異化
  const savingsRate = region === 'tw' ? 0.15 : region === 'jp' ? 0.18 : 0.25
  const annualContribution = Math.round(annualIncome * savingsRate)

  return { annualIncome, annualContribution }
}
