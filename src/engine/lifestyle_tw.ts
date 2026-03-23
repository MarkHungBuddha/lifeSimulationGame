/**
 * 台灣版生活風格系統
 *
 * 幣值單位：新台幣 (TWD)
 * 參考：主計總處薪資統計、家庭收支調查
 */

import type { LifestylePreset, LifestyleId } from './lifestyle'

export const LIFESTYLE_PRESETS_TW: Record<Exclude<LifestyleId, 'custom'>, LifestylePreset> = {
  frugal: {
    id: 'frugal',
    name: '小資族',
    emoji: '🌿',
    description: '省吃儉用，租屋雅房，自炊為主。月收入約4萬出頭，每月存下1萬多。',
    tagline: '少即是多',
    annualIncome: 504000,      // 月薪42K
    annualExpense: 360000,     // 月支出30K
    annualContribution: 100000,
    savingsRate: 0.20,
    retirementAge: 60,
    initialPortfolio: 1500000, // 150萬
    withdrawal: { type: 'fixed_amount', amount: 360000 },
    allocation: { sp500: 0.50, bond: 0.20, gold: 0.10, cash: 0.10, reits: 0.10 },
  },

  moderate: {
    id: 'moderate',
    name: '穩健上班族',
    emoji: '💼',
    description: '一般科技業或金融業上班族。月薪約5-6萬，偶爾出國旅遊，正常社交。',
    tagline: '穩中求進',
    annualIncome: 700000,      // 月薪58K
    annualExpense: 480000,     // 月支出40K
    annualContribution: 160000,
    savingsRate: 0.23,
    retirementAge: 65,
    initialPortfolio: 3000000, // 300萬
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    allocation: { sp500: 0.60, bond: 0.20, gold: 0.10, cash: 0.05, reits: 0.05 },
  },

  comfortable: {
    id: 'comfortable',
    name: '舒適生活',
    emoji: '🏡',
    description: '資深工程師/主管級。年薪百萬以上，有房貸，注重生活品質與子女教育。',
    tagline: '品質至上',
    annualIncome: 1200000,     // 月薪100K
    annualExpense: 720000,     // 月支出60K
    annualContribution: 350000,
    savingsRate: 0.29,
    retirementAge: 60,
    initialPortfolio: 8000000, // 800萬
    withdrawal: { type: 'fixed_amount', amount: 720000 },
    allocation: { sp500: 0.55, bond: 0.25, gold: 0.05, cash: 0.05, reits: 0.10 },
  },

  lavish: {
    id: 'lavish',
    name: '享樂族',
    emoji: '✨',
    description: '高收入高消費。雙B名車、高級餐廳、頻繁出國。活在當下。',
    tagline: '活在當下',
    annualIncome: 1800000,     // 月薪150K
    annualExpense: 1440000,    // 月支出120K
    annualContribution: 200000,
    savingsRate: 0.11,
    retirementAge: 67,
    initialPortfolio: 3000000, // 300萬
    withdrawal: { type: 'fixed_amount', amount: 1440000 },
    allocation: { sp500: 0.70, bond: 0.10, gold: 0.05, cash: 0.05, reits: 0.10 },
  },

  fire_lean: {
    id: 'fire_lean',
    name: 'Lean FIRE',
    emoji: '🔥',
    description: '極致儲蓄追求提早退休。目標累積1,500萬，月開銷控制在2.5萬以內。',
    tagline: '提早自由',
    annualIncome: 800000,      // 月薪67K
    annualExpense: 300000,     // 月支出25K
    annualContribution: 400000,
    savingsRate: 0.50,
    retirementAge: 40,
    initialPortfolio: 3000000, // 300萬
    withdrawal: { type: 'fixed_rate', rate: 0.035 },
    allocation: { sp500: 0.80, bond: 0.10, gold: 0.05, cash: 0.00, reits: 0.05 },
  },

  fire_fat: {
    id: 'fire_fat',
    name: 'Fat FIRE',
    emoji: '💎',
    description: '高階主管或創業者。目標累積3,000萬以上，退休後維持高品質生活。',
    tagline: '自由且富裕',
    annualIncome: 2400000,     // 月薪200K
    annualExpense: 840000,     // 月支出70K
    annualContribution: 1200000,
    savingsRate: 0.50,
    retirementAge: 45,
    initialPortfolio: 10000000, // 1000萬
    withdrawal: { type: 'fixed_amount', amount: 840000 },
    allocation: { sp500: 0.65, bond: 0.15, gold: 0.10, cash: 0.00, reits: 0.10 },
  },
}

export const LIFESTYLE_LIST_TW = Object.values(LIFESTYLE_PRESETS_TW)
