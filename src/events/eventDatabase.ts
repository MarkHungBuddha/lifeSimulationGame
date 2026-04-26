/**
 * 隨機事件資料庫
 * 資料來源：doc/monte_carlo_random_events.md
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
      { type: 'portfolio_change', value: -0.05 },
    ],
    correlatedWith: ['recession'],
  },
  {
    id: 'market_correction',
    name: '股市修正',
    category: 'market',
    description: '10-20% 回調（Bootstrap 已含市場波動，此為恐慌性贖回損失）',
    baseProbability: 0.12,
    durationMonths: [3, 6],
    impacts: [
      { type: 'portfolio_change', value: -0.015 },
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
      { type: 'portfolio_change', value: -0.04 },
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
    occupationModifiers: {
      1: { probabilityMultiplier: 0.8, name: 'Executive Displacement', description: 'Board restructuring puts your position at risk' },
      3: { probabilityMultiplier: 1.3, name: 'Position Automated Away', description: 'Your admin role is eliminated through automation' },
      4: { probabilityMultiplier: 1.2, name: 'Sales Team Downsized', description: 'Missed targets lead to sales team restructuring' },
      6: { probabilityMultiplier: 0.3, impactMultiplier: 0.8, name: 'Farm Labor Reduction', description: 'Rising costs force you to cut your own hours' },
      9: { probabilityMultiplier: 1.5, name: 'Tech Layoff Wave', description: 'Mass layoffs sweep the industry; your team is eliminated' },
      10: { name: 'Route Eliminated', description: 'Your company cuts the route you were assigned to' },
    },
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
    occupationModifiers: {
      1: { probabilityMultiplier: 1.3, impactMultiplier: 1.3, name: 'Bonus Clawback', description: 'Company misses targets; executive bonuses zeroed out' },
      4: { probabilityMultiplier: 1.5, impactMultiplier: 1.2, name: 'Commission Restructured', description: 'New commission tiers slash your effective take-home' },
      6: { probabilityMultiplier: 0.5, impactMultiplier: 0.8 },
    },
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
    occupationModifiers: {
      2: { probabilityMultiplier: 1.3, name: 'Sabbatical for Certification', description: 'You take time off to pursue an advanced credential' },
      9: { probabilityMultiplier: 1.5, name: 'Gap Year / Recharge', description: 'You quit to travel or build a side project — standard in tech' },
      8: { probabilityMultiplier: 0.5, impactMultiplier: 0.7, name: 'Waiting for Next Gig', description: 'Previous contract ended; waiting for the next assignment' },
    },
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
    occupationModifiers: {
      1: { probabilityMultiplier: 0.7, impactMultiplier: 1.5, name: 'C-Suite Promotion', description: 'You join the executive team with a massive comp package' },
      3: { impactMultiplier: 0.7, name: 'Office Manager Bump', description: 'Promoted to office manager — modest raise, more responsibility' },
      8: { probabilityMultiplier: 0.8, impactMultiplier: 0.6, name: 'Shift Lead Promotion', description: 'You become shift lead — small raise, better job security' },
      9: { probabilityMultiplier: 1.2, impactMultiplier: 1.2, name: 'Staff Engineer / Tech Lead', description: 'Promoted to senior technical track with significant RSU bump' },
    },
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
    occupationModifiers: {
      2: { probabilityMultiplier: 1.3, name: 'Professional Exhaustion', description: 'Years of high-stakes decisions take their toll' },
      6: { probabilityMultiplier: 0.5, impactMultiplier: 0.8, name: 'Physical Exhaustion', description: 'Season after season of hard labor wears your body down' },
      9: { probabilityMultiplier: 1.5, impactMultiplier: 1.2, name: 'Engineering Burnout', description: 'Endless on-call, sprint deadlines, and screen fatigue break you' },
    },
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
    occupationModifiers: {
      3: { probabilityMultiplier: 0.7, impactMultiplier: 0.8 },
      5: { probabilityMultiplier: 1.5, impactMultiplier: 1.2, name: 'Equipment Injury', description: 'Injured while operating machinery; weeks of recovery needed' },
      6: { probabilityMultiplier: 1.3, name: 'Farm Injury', description: 'Injured during farm work — machinery or livestock incident' },
      7: { probabilityMultiplier: 1.8, impactMultiplier: 1.3, name: 'Construction Site Injury', description: 'Fall or struck-by incident on the job site' },
      8: { probabilityMultiplier: 1.8, impactMultiplier: 1.3, name: 'Factory Floor Injury', description: 'Assembly line accident requires medical leave' },
      9: { probabilityMultiplier: 0.6, impactMultiplier: 0.7, name: 'Repetitive Strain Injury', description: 'Carpal tunnel or herniated disc from years at a desk' },
    },
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
    occupationModifiers: {
      3: { probabilityMultiplier: 0.6, impactMultiplier: 0.8 },
      7: { probabilityMultiplier: 2.0, impactMultiplier: 1.5, name: 'Severe Workplace Accident', description: 'Major construction accident causes lasting disability' },
      8: { probabilityMultiplier: 1.8, impactMultiplier: 1.5, name: 'Permanent Factory Injury', description: 'Severe manufacturing accident with long-term consequences' },
      9: { probabilityMultiplier: 0.5, impactMultiplier: 0.7 },
    },
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
    occupationModifiers: {
      3: { probabilityMultiplier: 0.8 },
      7: { probabilityMultiplier: 1.5, impactMultiplier: 1.2, name: 'Jobsite Emergency', description: 'On-site injury requires emergency room treatment' },
      8: { probabilityMultiplier: 1.3, impactMultiplier: 1.2, name: 'Workplace ER Visit', description: 'Injured on the job — ER visit, fortunately not critical' },
    },
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
    occupationModifiers: {
      2: { probabilityMultiplier: 1.2, name: 'High-Stakes Anxiety', description: 'The weight of life-or-death decisions triggers anxiety' },
      4: { probabilityMultiplier: 1.1, name: 'Sales Pressure Anxiety', description: 'Constant quota pressure leads to anxiety and insomnia' },
      7: { probabilityMultiplier: 0.7, impactMultiplier: 0.8 },
      8: { probabilityMultiplier: 0.7, impactMultiplier: 0.8 },
      9: { probabilityMultiplier: 1.4, impactMultiplier: 1.2, name: 'Tech Worker Mental Health Crisis', description: 'Always-on culture, imposter syndrome, and isolation take hold' },
    },
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
    ownerProbabilityMultiplier: 2.0,
    ownerExtraImpacts: [
      { type: 'extra_expense', value: 3 },
    ],
    occupationModifiers: {
      6: { impactMultiplier: 2.0, name: 'Farm Devastated by Disaster', description: 'The disaster destroys not just your home but your livelihood' },
    },
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
    occupationModifiers: {
      1: { impactMultiplier: 1.3, name: 'Executive Investment Fraud', description: 'Targeted by a sophisticated private-equity scam' },
      9: { probabilityMultiplier: 0.7, impactMultiplier: 0.8 },
    },
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
    housingCondition: 'owner_only',
  },

  {
    id: 'rent_increase',
    name: '房租大幅調漲',
    category: 'property',
    description: '房東漲租或被迫搬遷，租屋族獨有風險',
    baseProbability: 0.08,
    durationMonths: [1, 2],
    impacts: [
      { type: 'extra_expense', value: 1 },
    ],
    housingCondition: 'renter_only',
  },
  {
    id: 'property_tax_hike',
    name: 'Property Tax 大幅調漲',
    category: 'property',
    description: '地方政府重新評估房產價值，Property Tax 大幅上漲',
    baseProbability: 0.05,
    durationMonths: [0, 0],
    impacts: [
      { type: 'extra_expense', value: 1.5 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'mortgage_rate_increase',
    name: '房貸利率上升',
    category: 'property',
    description: 'ARM 利率重置或轉貸時利率上升，月付增加',
    baseProbability: 0.05,
    durationMonths: [12, 36],
    impacts: [
      { type: 'extra_expense', value: 1 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'hoa_special_assessment',
    name: 'HOA 特別費用',
    category: 'property',
    description: 'HOA 通過特別決議，需一次性繳納大額修繕費',
    baseProbability: 0.03,
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 2 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'neighbor_issue',
    name: '鄰居/社區問題',
    category: 'property',
    description: '噪音、治安惡化或嫌惡設施，影響生活品質與房價',
    baseProbability: 0.03,
    durationMonths: [6, 24],
    impacts: [
      { type: 'extra_expense', value: 0.5 },
    ],
    housingCondition: 'owner_only',
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

  // ================================================================
  // 職業專屬事件（美國版）
  // ================================================================

  // --- Management (id: 1) ---
  {
    id: 'us_occ1_exec_bonus',
    name: 'Executive Bonus',
    category: 'career',
    description: 'Your company exceeded targets, and the board approved a generous executive bonus.',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [1],
  },
  {
    id: 'us_occ1_golden_parachute',
    name: 'Forced Resignation',
    category: 'career',
    description: 'Board shake-up forces your resignation. Severance cushions the blow.',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'savings_boost', value: 0.05 },
    ],
    occupationIds: [1],
  },
  {
    id: 'us_occ1_ipo',
    name: 'Company IPO',
    category: 'career',
    description: 'Your company goes public. Your equity stakes are now worth real money.',
    baseProbability: 0.02,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.20 },
    ],
    isPositive: true,
    occupationIds: [1],
  },

  // --- Professional (id: 2) ---
  {
    id: 'us_occ2_malpractice',
    name: 'Malpractice Lawsuit',
    category: 'legal',
    description: 'A malpractice suit forces you to hire expensive legal counsel.',
    baseProbability: 0.02,
    ageProbabilities: [
      { minAge: 35, maxAge: 60, probability: 0.03 },
    ],
    durationMonths: [6, 24],
    impacts: [
      { type: 'extra_expense', value: 8 },
    ],
    occupationIds: [2],
  },
  {
    id: 'us_occ2_board_cert',
    name: 'Board Certification',
    category: 'career',
    description: 'You pass a prestigious board certification, boosting your market value.',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [2],
  },
  {
    id: 'us_occ2_research_grant',
    name: 'Research Grant',
    category: 'career',
    description: 'You secure a major research grant, bringing recognition and funding.',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.04 },
      { type: 'income_boost', value: 0.03 },
    ],
    isPositive: true,
    occupationIds: [2],
  },

  // --- Clerical/Admin (id: 3) ---
  {
    id: 'us_occ3_automation',
    name: 'Office Automation',
    category: 'career',
    description: 'AI and automation tools replace parts of your job duties.',
    baseProbability: 0.05,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.10 },
    ],
    occupationIds: [3],
  },
  {
    id: 'us_occ3_promotion_admin',
    name: 'Office Manager Promotion',
    category: 'career',
    description: 'You\'re promoted to office manager with a nice raise.',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [3],
  },
  {
    id: 'us_occ3_temp_layoff',
    name: 'Position Eliminated',
    category: 'career',
    description: 'Your position is eliminated in a cost-cutting measure.',
    baseProbability: 0.04,
    durationMonths: [2, 8],
    impacts: [
      { type: 'income_change', value: -0.25 },
    ],
    occupationIds: [3],
  },

  // --- Sales/Services (id: 4) ---
  {
    id: 'us_occ4_commission_boom',
    name: 'Record Commission Quarter',
    category: 'career',
    description: 'You land several big deals and earn record commissions.',
    baseProbability: 0.05,
    durationMonths: [1, 3],
    impacts: [
      { type: 'savings_boost', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [4],
  },
  {
    id: 'us_occ4_retail_decline',
    name: 'Retail Downturn',
    category: 'career',
    description: 'Consumer spending drops, and your sales-based income takes a hit.',
    baseProbability: 0.05,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [4],
  },
  {
    id: 'us_occ4_tips_boom',
    name: 'Tips Economy Boom',
    category: 'career',
    description: 'Tourism and dining boom bring in generous tips.',
    baseProbability: 0.04,
    durationMonths: [3, 6],
    impacts: [
      { type: 'income_change', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [4],
  },

  // --- Skilled Trades (id: 5) ---
  {
    id: 'us_occ5_union_raise',
    name: 'Union Contract Raise',
    category: 'career',
    description: 'Your union negotiates a strong new contract with better pay.',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.05 },
    ],
    isPositive: true,
    occupationIds: [5],
  },
  {
    id: 'us_occ5_workplace_injury',
    name: 'Workplace Injury',
    category: 'health',
    description: 'An on-the-job injury sidelines you for months.',
    baseProbability: 0.04,
    durationMonths: [2, 8],
    impacts: [
      { type: 'extra_expense', value: 4 },
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [5, 7, 8],
  },
  {
    id: 'us_occ5_apprentice_complete',
    name: 'Apprenticeship Complete',
    category: 'career',
    description: 'You complete your apprenticeship and become a journeyman with higher pay.',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 25, maxAge: 35, probability: 0.06 },
    ],
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [5],
  },

  // --- Agriculture (id: 6) ---
  {
    id: 'us_occ6_bumper_crop',
    name: 'Bumper Crop Year',
    category: 'career',
    description: 'Perfect weather and high commodity prices make this your best year.',
    baseProbability: 0.06,
    durationMonths: [3, 6],
    impacts: [
      { type: 'savings_boost', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [6],
  },
  {
    id: 'us_occ6_drought',
    name: 'Severe Drought',
    category: 'property',
    description: 'Severe drought devastates your crops. Federal aid helps but doesn\'t cover all losses.',
    baseProbability: 0.06,
    durationMonths: [3, 12],
    impacts: [
      { type: 'extra_expense', value: 4 },
      { type: 'income_change', value: -0.25 },
    ],
    occupationIds: [6],
  },
  {
    id: 'us_occ6_farm_subsidy',
    name: 'USDA Farm Subsidy',
    category: 'career',
    description: 'You qualify for a federal agricultural subsidy program.',
    baseProbability: 0.05,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.04 },
    ],
    isPositive: true,
    occupationIds: [6],
  },

  // --- Construction (id: 7) ---
  {
    id: 'us_occ7_infrastructure_boom',
    name: 'Infrastructure Bill Boom',
    category: 'career',
    description: 'Federal infrastructure spending creates abundant high-paying construction jobs.',
    baseProbability: 0.04,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: 0.12 },
    ],
    isPositive: true,
    occupationIds: [7],
  },
  {
    id: 'us_occ7_osha_fine',
    name: 'OSHA Safety Violation',
    category: 'legal',
    description: 'Your worksite gets cited for safety violations. Fines and slowdowns follow.',
    baseProbability: 0.03,
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [7, 8],
  },
  {
    id: 'us_occ7_winter_layoff',
    name: 'Seasonal Layoff',
    category: 'career',
    description: 'Winter weather halts construction. You\'re laid off until spring.',
    baseProbability: 0.06,
    durationMonths: [2, 4],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [7],
  },

  // --- Production/Manufacturing (id: 8) ---
  {
    id: 'us_occ8_plant_closure',
    name: 'Plant Closure',
    category: 'career',
    description: 'Your manufacturing plant shuts down due to offshoring.',
    baseProbability: 0.03,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.30 },
    ],
    occupationIds: [8],
  },
  {
    id: 'us_occ8_overtime_surge',
    name: 'Overtime Surge',
    category: 'career',
    description: 'A rush of orders means mandatory overtime with premium pay.',
    baseProbability: 0.06,
    durationMonths: [2, 6],
    impacts: [
      { type: 'savings_boost', value: 0.04 },
    ],
    isPositive: true,
    occupationIds: [8],
  },
  {
    id: 'us_occ8_tariff_boost',
    name: 'Tariff Protection',
    category: 'career',
    description: 'New tariffs on imports boost domestic manufacturing demand.',
    baseProbability: 0.03,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [8],
  },

  // --- IT/Digital (id: 9) ---
  {
    id: 'us_occ9_stock_vest',
    name: 'RSU Vesting Windfall',
    category: 'career',
    description: 'Your RSUs vest during a stock price surge. Major payday.',
    baseProbability: 0.05,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.12 },
    ],
    isPositive: true,
    occupationIds: [9],
  },
  {
    id: 'us_occ9_tech_layoff',
    name: 'Tech Industry Layoffs',
    category: 'career',
    description: 'Mass layoffs sweep the tech industry. Your position is eliminated.',
    baseProbability: 0.04,
    durationMonths: [3, 9],
    impacts: [
      { type: 'income_change', value: -0.20 },
    ],
    occupationIds: [9],
  },
  {
    id: 'us_occ9_faang_offer',
    name: 'FAANG Offer',
    category: 'career',
    description: 'You receive a competing offer from a major tech company with a significant raise.',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.15 },
    ],
    isPositive: true,
    occupationIds: [9],
  },
  {
    id: 'us_occ9_open_source',
    name: 'Open Source Recognition',
    category: 'career',
    description: 'Your open-source project gains thousands of stars and industry attention.',
    baseProbability: 0.02,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.05 },
    ],
    isPositive: true,
    occupationIds: [9],
  },

  // --- Transportation/Logistics (id: 10) ---
  {
    id: 'us_occ10_cdl_premium',
    name: 'CDL Driver Shortage Premium',
    category: 'career',
    description: 'A nationwide truck driver shortage pushes your pay up significantly.',
    baseProbability: 0.05,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [10],
  },
  {
    id: 'us_occ10_accident',
    name: 'Vehicle Accident',
    category: 'health',
    description: 'A road accident puts you out of work for recovery.',
    baseProbability: 0.04,
    durationMonths: [2, 8],
    impacts: [
      { type: 'extra_expense', value: 3 },
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [10],
  },
  {
    id: 'us_occ10_ev_transition',
    name: 'EV Transition Disruption',
    category: 'career',
    description: 'The shift to electric vehicles disrupts traditional logistics roles.',
    baseProbability: 0.03,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [10],
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
