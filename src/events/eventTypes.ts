/**
 * 隨機事件型別定義
 */

export type EventCategory =
  | 'market'    // 市場與經濟
  | 'career'    // 職涯與就業
  | 'health'    // 醫療與健康
  | 'family'    // 家庭與人生
  | 'property'  // 財產與資產
  | 'legal'     // 法律與稅務

export type ImpactType =
  | 'income_change'       // 收入百分比變化
  | 'savings_change'      // 儲蓄（投資帳戶）百分比變化
  | 'portfolio_change'    // 投資組合百分比變化
  | 'extra_expense'       // 額外支出（月收入倍數）
  | 'income_boost'        // 收入永久增加百分比
  | 'savings_boost'       // 儲蓄一次性增加百分比

export interface EventImpact {
  type: ImpactType
  value: number           // 百分比用小數 (如 -0.35 = -35%)，倍數用正數 (如 6 = 6x 月收入)
  permanent?: boolean     // 是否為永久性影響
}

/** 年齡區間機率調整 */
export interface AgeProbability {
  minAge: number
  maxAge: number
  probability: number     // 該年齡區間的年機率
}

export interface RandomEvent {
  id: string
  name: string
  category: EventCategory
  description: string
  baseProbability: number          // 基礎年機率
  ageProbabilities?: AgeProbability[]  // 年齡調整機率（覆蓋 baseProbability）
  durationMonths: [number, number] // [最短, 最長] 月
  impacts: EventImpact[]
  correlatedWith?: string[]        // 相關事件 ID（可能同時觸發）
  isPositive?: boolean             // 正面事件
}

/** 模擬中觸發的事件紀錄 */
export interface TriggeredEvent {
  event: RandomEvent
  age: number
  year: number            // 模擬第幾年
  actualImpacts: {        // 實際影響金額
    type: ImpactType
    description: string
    amount: number        // 實際美元金額（正=收益，負=損失）
  }[]
}
