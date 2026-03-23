/**
 * 生活風格系統
 *
 * 定義不同生活型態的預設參數，讓玩家快速選擇一種人生路線，
 * 也可以在預設基礎上微調。
 *
 * 生活風格影響：
 * - 年度生活開銷（退休前也會消耗現金流）
 * - 儲蓄率 / 年存入額
 * - 退休年齡目標
 * - 退休後提領金額
 * - 建議資產配置
 */

import type { Allocation, WithdrawalStrategy } from './simulator'

export type LifestyleId =
  | 'frugal'        // 極簡節約
  | 'moderate'      // 一般上班族
  | 'comfortable'   // 寬裕生活
  | 'lavish'        // 奢華消費
  | 'fire_lean'     // Lean FIRE
  | 'fire_fat'      // Fat FIRE
  | 'custom'        // 自訂

export interface LifestylePreset {
  id: LifestyleId
  name: string
  emoji: string
  description: string
  tagline: string

  // 收支參數
  annualIncome: number          // 年收入（稅前）
  annualExpense: number         // 年生活開銷
  annualContribution: number    // 年存入投資（= 收入 - 開銷 - 稅，簡化）
  savingsRate: number           // 儲蓄率（顯示用）

  // 退休參數
  retirementAge: number
  initialPortfolio: number
  withdrawal: WithdrawalStrategy

  // 建議配置
  allocation: Allocation
}

export const LIFESTYLE_PRESETS: Record<Exclude<LifestyleId, 'custom'>, LifestylePreset> = {
  frugal: {
    id: 'frugal',
    name: '極簡生活',
    emoji: '🌿',
    description: '極簡主義者，低開銷高儲蓄。不追求物質享受，專注於自由與時間。',
    tagline: '少即是多',
    annualIncome: 50000,
    annualExpense: 20000,
    annualContribution: 25000,
    savingsRate: 0.50,
    retirementAge: 55,
    initialPortfolio: 50000,
    withdrawal: { type: 'fixed_amount', amount: 20000 },
    allocation: { sp500: 0.50, bond: 0.20, gold: 0.10, cash: 0.10, reits: 0.10 },
  },

  moderate: {
    id: 'moderate',
    name: '一般上班族',
    emoji: '💼',
    description: '穩定薪資，適度消費。偶爾出國旅遊，正常社交與娛樂支出。',
    tagline: '平衡生活',
    annualIncome: 70000,
    annualExpense: 45000,
    annualContribution: 20000,
    savingsRate: 0.29,
    retirementAge: 65,
    initialPortfolio: 100000,
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    allocation: { sp500: 0.60, bond: 0.20, gold: 0.10, cash: 0.05, reits: 0.05 },
  },

  comfortable: {
    id: 'comfortable',
    name: '寬裕生活',
    emoji: '🏡',
    description: '高收入專業人士，注重生活品質。有房貸、子女教育費，但也有不錯的存款。',
    tagline: '品質至上',
    annualIncome: 120000,
    annualExpense: 80000,
    annualContribution: 30000,
    savingsRate: 0.25,
    retirementAge: 62,
    initialPortfolio: 250000,
    withdrawal: { type: 'fixed_amount', amount: 80000 },
    allocation: { sp500: 0.55, bond: 0.25, gold: 0.05, cash: 0.05, reits: 0.10 },
  },

  lavish: {
    id: 'lavish',
    name: '奢華消費',
    emoji: '✨',
    description: '高收入高消費。名車、高級餐廳、頻繁旅遊。享受當下，存款相對少。',
    tagline: '活在當下',
    annualIncome: 150000,
    annualExpense: 130000,
    annualContribution: 12000,
    savingsRate: 0.08,
    retirementAge: 67,
    initialPortfolio: 80000,
    withdrawal: { type: 'fixed_amount', amount: 120000 },
    allocation: { sp500: 0.70, bond: 0.10, gold: 0.05, cash: 0.05, reits: 0.10 },
  },

  fire_lean: {
    id: 'fire_lean',
    name: 'Lean FIRE',
    emoji: '🔥',
    description: '極致儲蓄追求提早退休。犧牲當下生活品質，換取 40 歲前的財務自由。',
    tagline: '提早自由',
    annualIncome: 80000,
    annualExpense: 24000,
    annualContribution: 48000,
    savingsRate: 0.60,
    retirementAge: 40,
    initialPortfolio: 100000,
    withdrawal: { type: 'fixed_rate', rate: 0.035 },
    allocation: { sp500: 0.80, bond: 0.10, gold: 0.05, cash: 0.00, reits: 0.05 },
  },

  fire_fat: {
    id: 'fire_fat',
    name: 'Fat FIRE',
    emoji: '💎',
    description: '高收入且高儲蓄，目標不只提早退休，還要退休後維持高品質生活。',
    tagline: '自由且富裕',
    annualIncome: 200000,
    annualExpense: 80000,
    annualContribution: 100000,
    savingsRate: 0.50,
    retirementAge: 45,
    initialPortfolio: 300000,
    withdrawal: { type: 'fixed_amount', amount: 80000 },
    allocation: { sp500: 0.65, bond: 0.15, gold: 0.10, cash: 0.00, reits: 0.10 },
  },
}

export const LIFESTYLE_LIST = Object.values(LIFESTYLE_PRESETS)
