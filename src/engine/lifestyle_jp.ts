/**
 * 日本版生活風格系統
 *
 * 幣值單位：日圓 (JPY)
 * 參考：国税庁 民間給与実態統計、総務省 家計調査
 */

import type { LifestylePreset, LifestyleId } from './lifestyle'

export const LIFESTYLE_PRESETS_JP: Record<Exclude<LifestyleId, 'custom'>, LifestylePreset> = {
  frugal: {
    id: 'frugal',
    name: '節約生活',
    emoji: '🌿',
    description: 'ミニマリスト。家賃の安いワンルーム、自炊中心。月収25万、月支出15万。',
    tagline: '少ないほど豊か',
    annualIncome: 3000000,       // 月25万
    annualExpense: 1800000,      // 月15万
    annualContribution: 800000,
    savingsRate: 0.27,
    retirementAge: 60,
    initialPortfolio: 5000000,   // 500万
    withdrawal: { type: 'fixed_amount', amount: 1800000 },
    allocation: { sp500: 0.30, intlStock: 0.20, bond: 0.20, gold: 0.10, cash: 0.10, reits: 0.10 },
  },

  moderate: {
    id: 'moderate',
    name: '一般会社員',
    emoji: '💼',
    description: '正社員、平均的な給与水準。月収38万（賞与込み）、適度な消費。',
    tagline: 'バランス重視',
    annualIncome: 4600000,       // 正社員平均
    annualExpense: 3000000,      // 月25万
    annualContribution: 1200000,
    savingsRate: 0.26,
    retirementAge: 65,
    initialPortfolio: 10000000,  // 1000万
    withdrawal: { type: 'fixed_rate', rate: 0.04 },
    allocation: { sp500: 0.20, intlStock: 0.30, bond: 0.20, gold: 0.10, cash: 0.15, reits: 0.05 },
  },

  comfortable: {
    id: 'comfortable',
    name: '余裕のある生活',
    emoji: '🏡',
    description: '大企業管理職・専門職。年収800万以上、住宅ローンあり、子供の教育費も。',
    tagline: '品質重視',
    annualIncome: 8000000,       // 月67万
    annualExpense: 5400000,      // 月45万
    annualContribution: 1800000,
    savingsRate: 0.23,
    retirementAge: 62,
    initialPortfolio: 25000000,  // 2500万
    withdrawal: { type: 'fixed_amount', amount: 5400000 },
    allocation: { sp500: 0.20, intlStock: 0.25, bond: 0.25, gold: 0.10, cash: 0.10, reits: 0.10 },
  },

  lavish: {
    id: 'lavish',
    name: '贅沢な暮らし',
    emoji: '✨',
    description: '高収入・高消費。タワマン、高級車、頻繁な海外旅行。今を楽しむ。',
    tagline: '今を生きる',
    annualIncome: 12000000,      // 月100万
    annualExpense: 9600000,      // 月80万
    annualContribution: 1500000,
    savingsRate: 0.13,
    retirementAge: 67,
    initialPortfolio: 15000000,  // 1500万
    withdrawal: { type: 'fixed_amount', amount: 9600000 },
    allocation: { sp500: 0.25, intlStock: 0.30, bond: 0.15, gold: 0.10, cash: 0.10, reits: 0.10 },
  },

  fire_lean: {
    id: 'fire_lean',
    name: 'Lean FIRE',
    emoji: '🔥',
    description: '極限の節約でFIRE達成。NISA+iDeCo最大活用、月支出15万で40歳リタイア。',
    tagline: '早期の自由',
    annualIncome: 6000000,       // 月50万
    annualExpense: 1800000,      // 月15万
    annualContribution: 3500000,
    savingsRate: 0.58,
    retirementAge: 40,
    initialPortfolio: 10000000,  // 1000万
    withdrawal: { type: 'fixed_rate', rate: 0.035 },
    allocation: { sp500: 0.15, intlStock: 0.55, bond: 0.15, gold: 0.10, cash: 0.00, reits: 0.05 },
  },

  fire_fat: {
    id: 'fire_fat',
    name: 'Fat FIRE',
    emoji: '💎',
    description: '高収入＋高貯蓄。目標1億円以上で退職後も豊かな生活を維持。',
    tagline: '自由で豊か',
    annualIncome: 15000000,      // 月125万
    annualExpense: 6000000,      // 月50万
    annualContribution: 7000000,
    savingsRate: 0.47,
    retirementAge: 45,
    initialPortfolio: 30000000,  // 3000万
    withdrawal: { type: 'fixed_amount', amount: 6000000 },
    allocation: { sp500: 0.15, intlStock: 0.45, bond: 0.20, gold: 0.10, cash: 0.00, reits: 0.10 },
  },
}

export const LIFESTYLE_LIST_JP = Object.values(LIFESTYLE_PRESETS_JP)
