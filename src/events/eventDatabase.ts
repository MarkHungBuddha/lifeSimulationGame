/**
 * 隨機事件資料庫
 * 資料來源：monte_carlo_random_events.md
 * BLS JOLTS, SSA, Hartford Funds, CDC/KFF, Morningstar, NSC, Pew Research
 */

import type { RandomEvent, EventCategory } from './eventTypes'

export const EVENT_DATABASE: RandomEvent[] = [
  // ================================================================
  // 市場與經濟
  // ================================================================
  {
    id: 'market_crash',
    name: '股市崩盤',
    category: 'market',
    description: '熊市 ≥20% 下跌（Bootstrap 已含市場報酬，此為額外恐慌衝擊）',
    baseProbability: 0.08,
    durationMonths: [9, 18],
    impacts: [
      { type: 'portfolio_change', value: -0.10 },
    ],
    correlatedWith: ['recession'],
  },
  {
    id: 'market_correction',
    name: '股市修正',
    category: 'market',
    description: '10-20% 回調（Bootstrap 已含市場波動，此為恐慌性贖回損失）',
    baseProbability: 0.15,
    durationMonths: [3, 6],
    impacts: [
      { type: 'portfolio_change', value: -0.03 },
    ],
  },
  {
    id: 'recession',
    name: '經濟衰退',
    category: 'market',
    description: 'GDP 連續兩季負成長，影響就業與投資',
    baseProbability: 0.08,
    durationMonths: [12, 24],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'portfolio_change', value: -0.08 },
    ],
    correlatedWith: ['market_crash', 'layoff', 'pay_cut'],
  },
  {
    id: 'high_inflation',
    name: '高通膨期',
    category: 'market',
    description: '通膨率 >5%，購買力大幅侵蝕',
    baseProbability: 0.06,
    durationMonths: [12, 36],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'currency_devaluation',
    name: '貨幣大幅貶值',
    category: 'market',
    description: '本幣貶值 >15%，影響海外資產與進口物價',
    baseProbability: 0.04,
    durationMonths: [6, 18],
    impacts: [
      { type: 'savings_change', value: -0.05 },
    ],
  },

  // ================================================================
  // 職涯與就業
  // ================================================================
  {
    id: 'layoff',
    name: '非自願失業',
    category: 'career',
    description: '遭到裁員，平均失業期約 6 個月',
    baseProbability: 0.012,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.015 },
      { minAge: 30, maxAge: 39, probability: 0.012 },
      { minAge: 40, maxAge: 49, probability: 0.010 },
      { minAge: 50, maxAge: 59, probability: 0.008 },
      { minAge: 60, maxAge: 99, probability: 0.006 },
    ],
    durationMonths: [3, 9],
    impacts: [
      { type: 'income_change', value: -0.50 },
      { type: 'savings_change', value: -0.05 },
      { type: 'extra_expense', value: 1 },
    ],
    correlatedWith: ['recession', 'mental_health'],
  },
  {
    id: 'pay_cut',
    name: '非自願降薪',
    category: 'career',
    description: '降薪或縮減工時，經濟衰退期更常見',
    baseProbability: 0.03,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'savings_change', value: -0.05 },
    ],
    correlatedWith: ['recession'],
  },
  {
    id: 'career_break',
    name: '職涯中斷',
    category: 'career',
    description: '自願轉職空窗期，1-3 個月無收入',
    baseProbability: 0.05,
    durationMonths: [1, 3],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'savings_change', value: -0.02 },
    ],
  },
  {
    id: 'promotion',
    name: '升遷加薪',
    category: 'career',
    description: '重大升遷，薪資提升 10-20%',
    baseProbability: 0.15,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.15, permanent: true },
      { type: 'savings_boost', value: 0.05 },
    ],
    isPositive: true,
  },
  {
    id: 'burnout',
    name: '職業倦怠',
    category: 'career',
    description: '身心耗竭，需要強制休息',
    baseProbability: 0.05,
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.15 },
      { type: 'savings_change', value: -0.02 },
    ],
    correlatedWith: ['mental_health'],
  },

  // ================================================================
  // 醫療與健康
  // ================================================================
  {
    id: 'short_disability',
    name: '短期失能',
    category: 'health',
    description: '因傷病短期無法工作（< 6 個月）',
    baseProbability: 0.056,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.040 },
      { minAge: 30, maxAge: 34, probability: 0.050 },
      { minAge: 35, maxAge: 39, probability: 0.056 },
      { minAge: 40, maxAge: 44, probability: 0.060 },
      { minAge: 45, maxAge: 49, probability: 0.070 },
      { minAge: 50, maxAge: 54, probability: 0.080 },
      { minAge: 55, maxAge: 59, probability: 0.090 },
      { minAge: 60, maxAge: 99, probability: 0.100 },
    ],
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.15 },
      { type: 'extra_expense', value: 1.5 },
    ],
  },
  {
    id: 'long_disability',
    name: '長期失能',
    category: 'health',
    description: '嚴重傷病導致長期無法工作（≥ 6 個月）',
    baseProbability: 0.005,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.002 },
      { minAge: 30, maxAge: 34, probability: 0.003 },
      { minAge: 35, maxAge: 39, probability: 0.005 },
      { minAge: 40, maxAge: 44, probability: 0.006 },
      { minAge: 45, maxAge: 49, probability: 0.008 },
      { minAge: 50, maxAge: 54, probability: 0.012 },
      { minAge: 55, maxAge: 59, probability: 0.018 },
      { minAge: 60, maxAge: 99, probability: 0.025 },
    ],
    durationMonths: [6, 60],
    impacts: [
      { type: 'income_change', value: -0.40 },
      { type: 'savings_change', value: -0.10 },
      { type: 'extra_expense', value: 3 },
    ],
    correlatedWith: ['critical_illness'],
  },
  {
    id: 'critical_illness',
    name: '重大疾病',
    category: 'health',
    description: '癌症等重大疾病診斷，醫療費用極高',
    baseProbability: 0.005,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.002 },
      { minAge: 30, maxAge: 34, probability: 0.003 },
      { minAge: 35, maxAge: 39, probability: 0.005 },
      { minAge: 40, maxAge: 44, probability: 0.008 },
      { minAge: 45, maxAge: 49, probability: 0.012 },
      { minAge: 50, maxAge: 54, probability: 0.018 },
      { minAge: 55, maxAge: 59, probability: 0.025 },
      { minAge: 60, maxAge: 99, probability: 0.035 },
    ],
    durationMonths: [6, 24],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'savings_change', value: -0.10 },
      { type: 'extra_expense', value: 3 },
    ],
    correlatedWith: ['long_disability'],
  },
  {
    id: 'er_visit',
    name: '急診住院',
    category: 'health',
    description: '非重大急診或短期住院',
    baseProbability: 0.12,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.08 },
      { minAge: 30, maxAge: 34, probability: 0.10 },
      { minAge: 35, maxAge: 39, probability: 0.12 },
      { minAge: 40, maxAge: 44, probability: 0.13 },
      { minAge: 45, maxAge: 49, probability: 0.15 },
      { minAge: 50, maxAge: 54, probability: 0.18 },
      { minAge: 55, maxAge: 59, probability: 0.22 },
      { minAge: 60, maxAge: 99, probability: 0.28 },
    ],
    durationMonths: [0.25, 1],
    impacts: [
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'mental_health',
    name: '心理健康問題',
    category: 'health',
    description: '憂鬱、焦慮等心理健康問題',
    baseProbability: 0.08,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.10 },
      { minAge: 30, maxAge: 34, probability: 0.08 },
      { minAge: 35, maxAge: 39, probability: 0.08 },
      { minAge: 40, maxAge: 44, probability: 0.07 },
      { minAge: 45, maxAge: 49, probability: 0.06 },
      { minAge: 50, maxAge: 54, probability: 0.05 },
      { minAge: 55, maxAge: 59, probability: 0.04 },
      { minAge: 60, maxAge: 99, probability: 0.03 },
    ],
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 1 },
    ],
    correlatedWith: ['burnout', 'layoff'],
  },

  // ================================================================
  // 家庭與人生
  // ================================================================
  {
    id: 'marriage',
    name: '結婚',
    category: 'family',
    description: '步入婚姻，婚禮支出但雙薪增加穩定性',
    baseProbability: 0.05,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.08 },
      { minAge: 30, maxAge: 34, probability: 0.07 },
      { minAge: 35, maxAge: 39, probability: 0.05 },
      { minAge: 40, maxAge: 44, probability: 0.03 },
      { minAge: 45, maxAge: 49, probability: 0.02 },
      { minAge: 50, maxAge: 54, probability: 0.01 },
      { minAge: 55, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'income_boost', value: 0.05, permanent: true },
      { type: 'savings_boost', value: 0.10 },
    ],
    isPositive: true,
  },
  {
    id: 'divorce',
    name: '離婚',
    category: 'family',
    description: '婚姻破裂，資產分割與律師費',
    baseProbability: 0.015,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.010 },
      { minAge: 30, maxAge: 34, probability: 0.015 },
      { minAge: 35, maxAge: 39, probability: 0.018 },
      { minAge: 40, maxAge: 44, probability: 0.015 },
      { minAge: 45, maxAge: 49, probability: 0.012 },
      { minAge: 50, maxAge: 54, probability: 0.010 },
      { minAge: 55, maxAge: 59, probability: 0.008 },
      { minAge: 60, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [6, 24],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'portfolio_change', value: -0.15 },
      { type: 'extra_expense', value: 2 },
    ],
    correlatedWith: ['mental_health'],
  },
  {
    id: 'child_birth',
    name: '生育小孩',
    category: 'family',
    description: '迎接新生命，永久增加月支出',
    baseProbability: 0.04,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.05 },
      { minAge: 30, maxAge: 34, probability: 0.06 },
      { minAge: 35, maxAge: 39, probability: 0.05 },
      { minAge: 40, maxAge: 44, probability: 0.03 },
      { minAge: 45, maxAge: 49, probability: 0.01 },
      { minAge: 50, maxAge: 99, probability: 0.002 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'savings_boost', value: -0.03, permanent: true },
    ],
  },
  {
    id: 'family_illness',
    name: '家人重病',
    category: 'family',
    description: '家庭成員重大疾病或事故，需請假照護',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 2 },
    ],
  },
  {
    id: 'inheritance',
    name: '遺產/意外之財',
    category: 'family',
    description: '繼承遺產、獲得禮金或意外收入',
    baseProbability: 0.01,
    durationMonths: [0, 0],
    impacts: [
      { type: 'savings_boost', value: 0.50 },
    ],
    isPositive: true,
  },

  // ================================================================
  // 財產與資產
  // ================================================================
  {
    id: 'natural_disaster',
    name: '住宅天災損害',
    category: 'property',
    description: '火災、地震、颱風等造成住宅損害',
    baseProbability: 0.003,
    durationMonths: [3, 12],
    impacts: [
      { type: 'savings_change', value: -0.05 },
      { type: 'extra_expense', value: 3 },
    ],
  },
  {
    id: 'car_accident',
    name: '車禍交通事故',
    category: 'property',
    description: '車輛損壞、醫療費用與誤工損失',
    baseProbability: 0.02,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.030 },
      { minAge: 30, maxAge: 34, probability: 0.025 },
      { minAge: 35, maxAge: 39, probability: 0.020 },
      { minAge: 40, maxAge: 44, probability: 0.018 },
      { minAge: 45, maxAge: 49, probability: 0.015 },
      { minAge: 50, maxAge: 54, probability: 0.012 },
      { minAge: 55, maxAge: 59, probability: 0.010 },
      { minAge: 60, maxAge: 99, probability: 0.008 },
    ],
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 1.5 },
    ],
  },
  {
    id: 'fraud',
    name: '詐騙/身分盜竊',
    category: 'property',
    description: '身分被盜用或遭遇詐騙，財務與時間損失',
    baseProbability: 0.05,
    durationMonths: [1, 6],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'home_repair',
    name: '重大房屋維修',
    category: 'property',
    description: '冷氣、熱水器、屋頂等重大維修支出',
    baseProbability: 0.15,
    durationMonths: [0.5, 1],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 2 },
    ],
  },

  // ================================================================
  // 法律與稅務
  // ================================================================
  {
    id: 'tax_audit',
    name: '稅務稽核',
    category: 'legal',
    description: '被稅務機關抽查稽核，補稅與罰款',
    baseProbability: 0.006,
    durationMonths: [3, 12],
    impacts: [
      { type: 'savings_change', value: -0.02 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'lawsuit',
    name: '法律訴訟',
    category: 'legal',
    description: '被告訴訟，律師費與和解金',
    baseProbability: 0.01,
    durationMonths: [6, 24],
    impacts: [
      { type: 'savings_change', value: -0.05 },
      { type: 'extra_expense', value: 2 },
    ],
  },
  {
    id: 'tax_change',
    name: '不利稅法變動',
    category: 'legal',
    description: '稅率調整或免稅額縮減',
    baseProbability: 0.05,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_change', value: -0.03, permanent: true },
      { type: 'savings_boost', value: -0.02, permanent: true },
    ],
  },
]

export const EVENT_MAP = new Map(EVENT_DATABASE.map(e => [e.id, e]))

/** 依類別分組 */
export const EVENTS_BY_CATEGORY = EVENT_DATABASE.reduce((acc, e) => {
  if (!acc[e.category]) acc[e.category] = []
  acc[e.category].push(e)
  return acc
}, {} as Record<string, RandomEvent[]>)

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  market: '市場與經濟',
  career: '職涯與就業',
  health: '醫療與健康',
  family: '家庭與人生',
  property: '財產與資產',
  legal: '法律與稅務',
  immigration: '移民相關',
}
