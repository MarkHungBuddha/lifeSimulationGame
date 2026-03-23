/**
 * 移民模組型別定義
 *
 * 移民是多階段隨機路徑，每個階段有成功/失敗分支：
 * 準備期 → 簽證申請 → 過渡期 → 定居期 → 永住/入籍
 * 任何階段都可能觸發回國
 */

import type { Region } from '../config/regions'

export type ImmigrationPhase =
  | 'none'            // 尚未開始或未啟用
  | 'preparing'       // 語言學習 + 求職（仍在出發國）
  | 'visa_applying'   // 簽證申請 / H-1B 抽籤中
  | 'visa_failed'     // 本次簽證失敗，可能再次嘗試
  | 'transition'      // 抵達目標國，初期安頓
  | 'settled'         // 持工作簽證定居中
  | 'permanent'       // 已取得永住/綠卡
  | 'forced_return'   // 被迫回國（簽證到期/裁員）
  | 'returned'        // 已回到出發國
  | 'abandoned'       // 多次失敗後放棄移民

export interface ImmigrationPlan {
  enabled: boolean
  originRegion: Region
  targetRegion: Region        // 'jp' or 'us'
  triggerAge: number          // 開始準備的年齡
  maxAttempts: number         // 簽證最大嘗試次數（預設 3）
}

export interface ImmigrationState {
  phase: ImmigrationPhase
  phaseStartAge: number
  yearsInTarget: number       // 在目標國居住年數
  failedAttempts: number
  hasPermanentResidency: boolean
  totalImmigrationCost: number
}

/** 移民路線參數 */
export interface ImmigrationRoute {
  origin: Region
  target: Region
  preparationYears: number          // 準備期年數
  preparationCostPerYear: number    // 每年準備費（出發國幣值）
  visaSuccessRate: number           // 每次簽證成功率
  transitionCost: number            // 一次性過渡成本（出發國幣值）
  settlementPremium: number         // 初期生活費加成（例 1.25 = +25%）
  settlementPremiumYears: number    // 加成持續年數
  prEligibleAfterYears: number      // 幾年後可申請永住
  prSuccessRate: number             // 永住申請成功率
  annualReturnRate: number          // 定居期每年被迫回國率
  returnCost: number                // 回國重置成本（出發國幣值）
  returnIncomePenalty: number       // 回國後收入懲罰（乘數，如 0.9 = -10%）
  incomeMultiplier: number          // 移民後收入倍率（相對出發國）
  expenseMultiplier: number         // 移民後支出倍率
}

export const INITIAL_IMMIGRATION_STATE: ImmigrationState = {
  phase: 'none',
  phaseStartAge: 0,
  yearsInTarget: 0,
  failedAttempts: 0,
  hasPermanentResidency: false,
  totalImmigrationCost: 0,
}
