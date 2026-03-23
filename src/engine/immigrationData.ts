/**
 * 移民路線資料
 * 資料來源：monte_carlo_immigration.md
 *
 * 台灣 → 日本：簽證容易、成本低、永住快（HSP）
 * 台灣 → 美國：薪資極高但 H-1B 抽籤僅 25%、成本高
 */

import type { ImmigrationRoute } from './immigrationTypes'
import type { RandomEvent } from '../events/eventTypes'

// ============================================================
// 路線參數
// ============================================================

export const ROUTE_TW_TO_JP: ImmigrationRoute = {
  origin: 'tw',
  target: 'jp',
  preparationYears: 1,
  preparationCostPerYear: 200000,    // 20萬 TWD（語言學校+考試+求職）
  visaSuccessRate: 0.85,             // 有 offer 即 85%+
  transitionCost: 300000,            // 30萬 TWD（敷金禮金+家具+緊急備用金）
  settlementPremium: 1.25,           // 初期生活費 +25%
  settlementPremiumYears: 2,
  prEligibleAfterYears: 3,           // HSP 70點→3年
  prSuccessRate: 0.75,
  annualReturnRate: 0.05,            // 前3年每年5%回國率
  returnCost: 150000,                // 15萬 TWD
  returnIncomePenalty: 0.90,         // 回國後收入 -10%
  incomeMultiplier: 1.4,             // 日本SWE 收入約台灣 1.4 倍
  expenseMultiplier: 1.6,            // 日本生活費約台灣 1.6 倍
}

export const ROUTE_TW_TO_US: ImmigrationRoute = {
  origin: 'tw',
  target: 'us',
  preparationYears: 1,
  preparationCostPerYear: 250000,    // 25萬 TWD
  visaSuccessRate: 0.25,             // H-1B 抽籤 ~25%
  transitionCost: 600000,            // 60萬 TWD
  settlementPremium: 1.30,           // 初期生活費 +30%
  settlementPremiumYears: 2,
  prEligibleAfterYears: 3,           // EB-2 台灣出生 ~2-5年，取中間值
  prSuccessRate: 0.80,
  annualReturnRate: 0.03,            // H-1B 裁員→60天找工作
  returnCost: 300000,                // 30萬 TWD
  returnIncomePenalty: 0.85,         // 回國後收入 -15%
  incomeMultiplier: 3.5,             // 美國SWE TC 約台灣 3.5 倍
  expenseMultiplier: 3.0,            // 美國生活費約台灣 3 倍
}

export function getImmigrationRoute(origin: string, target: string): ImmigrationRoute | null {
  if (origin === 'tw' && target === 'jp') return ROUTE_TW_TO_JP
  if (origin === 'tw' && target === 'us') return ROUTE_TW_TO_US
  return null
}

// ============================================================
// 移民專屬隨機事件
// ============================================================

export const IMMIGRATION_EVENTS_JP: RandomEvent[] = [
  {
    id: 'imm_jp_visa_crisis',
    name: '簽證危機（公司問題）',
    category: 'immigration',
    description: '公司倒閉/裁員，需在3個月內找到新工作否則失去簽證',
    baseProbability: 0.01,
    durationMonths: [1, 3],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'extra_expense', value: 0.5 },
    ],
  },
  {
    id: 'imm_jp_language_barrier',
    name: '日語能力瓶頸',
    category: 'immigration',
    description: '外資泡泡外難以升遷，收入成長停滞',
    baseProbability: 0.15,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.18 },
      { minAge: 35, maxAge: 44, probability: 0.12 },
      { minAge: 45, maxAge: 99, probability: 0.08 },
    ],
    durationMonths: [6, 24],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
  },
  {
    id: 'imm_jp_culture_shock',
    name: '文化衝擊・不適應',
    category: 'immigration',
    description: '日本職場文化壓力、孤獨感、生活不適應',
    baseProbability: 0.05,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'imm_jp_discrimination',
    name: '職場歧視・排擠',
    category: 'immigration',
    description: '外國人差別待遇，影響心理健康與職涯發展',
    baseProbability: 0.05,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.08 },
      { type: 'extra_expense', value: 0.2 },
    ],
  },
  {
    id: 'imm_jp_gaishi_offer',
    name: '取得外資高薪 offer',
    category: 'immigration',
    description: '外資 IT 企業（Google/Amazon Japan 等）大幅加薪',
    baseProbability: 0.10,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.40, permanent: true },
      { type: 'savings_boost', value: 0.05 },
    ],
    isPositive: true,
  },
  {
    id: 'imm_jp_fx_shock',
    name: '匯率大幅變動',
    category: 'immigration',
    description: '日圓急升/急貶，影響匯回台灣的實際價值',
    baseProbability: 0.05,
    durationMonths: [6, 18],
    impacts: [
      { type: 'savings_change', value: -0.05 },
    ],
  },
]

export const IMMIGRATION_EVENTS_US: RandomEvent[] = [
  {
    id: 'imm_us_layoff_visa',
    name: '裁員→60天簽證危機',
    category: 'immigration',
    description: 'H-1B 持有者被裁後只有 60 天寬限期找新雇主',
    baseProbability: 0.03,
    durationMonths: [1, 2],
    impacts: [
      { type: 'income_change', value: -0.30 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'imm_us_gc_delay',
    name: '綠卡排期延長',
    category: 'immigration',
    description: '排期延長 1-3 年，身份不確定性增加',
    baseProbability: 0.05,
    durationMonths: [12, 36],
    impacts: [
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'imm_us_no_sponsor',
    name: '公司不願 sponsor 綠卡',
    category: 'immigration',
    description: '需轉職到願意 sponsor 的公司',
    baseProbability: 0.10,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.10 },
      { type: 'extra_expense', value: 0.5 },
    ],
  },
  {
    id: 'imm_us_medical_bill',
    name: '高額醫療帳單',
    category: 'immigration',
    description: '美國醫療系統特有風險，自付額可達數萬美元',
    baseProbability: 0.05,
    durationMonths: [1, 12],
    impacts: [
      { type: 'extra_expense', value: 2 },
    ],
  },
  {
    id: 'imm_us_discrimination',
    name: '種族歧視/仇亞事件',
    category: 'immigration',
    description: '心理健康影響，可能觸發搬遷或回國念頭',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 0.2 },
    ],
  },
  {
    id: 'imm_us_faang_offer',
    name: '取得大廠 offer (FAANG)',
    category: 'immigration',
    description: 'TC 跳升至 $200-400K+，加速綠卡申請',
    baseProbability: 0.08,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.50, permanent: true },
      { type: 'savings_boost', value: 0.08 },
    ],
    isPositive: true,
  },
  {
    id: 'imm_us_policy_change',
    name: '移民政策收緊',
    category: 'immigration',
    description: '簽證費大增/審查趨嚴/類別限制（川普政策等）',
    baseProbability: 0.05,
    durationMonths: [0, 0],
    impacts: [
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'imm_us_culture_shock',
    name: '文化不適應',
    category: 'immigration',
    description: '個人主義文化差異、槍擊治安、孤獨感',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'imm_us_fx_shock',
    name: '匯率大幅變動',
    category: 'immigration',
    description: 'TWD/USD 大幅波動，影響台灣資產的美元計價',
    baseProbability: 0.05,
    durationMonths: [6, 18],
    impacts: [
      { type: 'savings_change', value: -0.04 },
    ],
  },
]

export function getImmigrationEvents(target: string): RandomEvent[] {
  if (target === 'jp') return IMMIGRATION_EVENTS_JP
  if (target === 'us') return IMMIGRATION_EVENTS_US
  return []
}
