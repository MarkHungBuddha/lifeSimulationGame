/**
 * 職業系統型別定義
 *
 * 職業管收入面（起薪 + 年度加薪），生活風格管支出面。
 * 10 職業 × 6 風格 = 60 種組合。
 */

import type { Region } from '../config/regions'

/** 職業定義 */
export interface OccupationDef {
  id: number                              // 1~10
  name: Record<Region, string>
  emoji: string
  description: Record<Region, string>
  baseSalary: Record<Region, number>      // 年薪（各國幣別）
  raiseRange: Record<Region, [number, number]>  // [min%, max%]
  /** 加薪隨年齡遞減的係數 */
  ageRaiseFactor: { youngBoost: number; midFactor: number; seniorFactor: number }
}

/** 職業計畫（傳入 simulator） */
export interface OccupationPlan {
  enabled: boolean
  occupationId: number
}

/** 預設職業計畫 */
export const INITIAL_OCCUPATION_PLAN: OccupationPlan = {
  enabled: false,
  occupationId: 2,  // 預設：專業人員
}
