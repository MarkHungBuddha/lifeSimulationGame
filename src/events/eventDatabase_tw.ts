/**
 * 台灣版隨機事件資料庫
 * 資料來源：monte_carlo_taiwan.md
 * 主計總處、內政部、勞動部、衛福部健保署、金管會、台灣癌症登記中心
 *
 * 與美國版關鍵差異：
 * - 全民健保大幅降低醫療財務風險
 * - 台股波動高於美股（σ≈25% vs 18%）
 * - 台海地緣政治為獨有尾部風險
 * - 天災風險較高（地震+颱風）
 * - 社會安全網（勞保失業給付等）緩衝負面衝擊
 */

import type { RandomEvent, EventCategory } from './eventTypes'

export const EVENT_DATABASE_TW: RandomEvent[] = [
  // ================================================================
  // 市場與經濟（台灣版）
  // ================================================================
  {
    id: 'tw_market_crash',
    name: '台股崩盤',
    category: 'market',
    description: '台股跌幅≥20%，歷史平均每3-4年一次',
    baseProbability: 0.10,
    durationMonths: [6, 24],
    impacts: [
      { type: 'portfolio_change', value: -0.12 },
    ],
    correlatedWith: ['tw_recession'],
  },
  {
    id: 'tw_market_correction',
    name: '台股修正',
    category: 'market',
    description: '10-20% 回調，台股波動度高於美股',
    baseProbability: 0.18,
    durationMonths: [2, 6],
    impacts: [
      { type: 'portfolio_change', value: -0.04 },
    ],
  },
  {
    id: 'tw_recession',
    name: '台灣經濟衰退',
    category: 'market',
    description: '出口衰退，GDP負成長，影響就業',
    baseProbability: 0.06,
    durationMonths: [12, 18],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'portfolio_change', value: -0.08 },
    ],
    correlatedWith: ['tw_market_crash', 'tw_layoff', 'tw_unpaid_leave'],
  },
  {
    id: 'tw_high_inflation',
    name: '高通膨期',
    category: 'market',
    description: 'CPI>3%，台灣近年通膨壓力增加',
    baseProbability: 0.08,
    durationMonths: [12, 24],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 0.8 },
    ],
  },
  {
    id: 'tw_currency_devaluation',
    name: '新台幣大幅貶值',
    category: 'market',
    description: '台幣貶值>10%，進口物價上漲',
    baseProbability: 0.05,
    durationMonths: [6, 18],
    impacts: [
      { type: 'savings_change', value: -0.04 },
    ],
  },
  {
    id: 'tw_geopolitical',
    name: '台海地緣政治危機',
    category: 'market',
    description: '台海緊張情勢升級，外資撤離，股匯雙殺',
    baseProbability: 0.02,
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.10 },
      { type: 'portfolio_change', value: -0.20 },
    ],
    correlatedWith: ['tw_market_crash', 'tw_currency_devaluation'],
  },
  {
    id: 'tw_housing_correction',
    name: '房地產價格修正',
    category: 'market',
    description: '房價下跌>10%，影響不動產資產價值',
    baseProbability: 0.03,
    durationMonths: [24, 60],
    impacts: [
      { type: 'portfolio_change', value: -0.08 },
    ],
  },

  // ================================================================
  // 職涯與就業（台灣版）
  // ================================================================
  {
    id: 'tw_layoff',
    name: '非自願失業（資遣）',
    category: 'career',
    description: '遭資遣，可領失業給付（投保薪資60%，最長6個月）',
    baseProbability: 0.01,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.012 },
      { minAge: 30, maxAge: 39, probability: 0.010 },
      { minAge: 40, maxAge: 49, probability: 0.008 },
      { minAge: 50, maxAge: 59, probability: 0.007 },
      { minAge: 60, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [2, 6],
    impacts: [
      { type: 'income_change', value: -0.40 },  // 扣除失業給付後淨損
      { type: 'savings_change', value: -0.03 },
    ],
    correlatedWith: ['tw_recession', 'tw_mental_health'],
  },
  {
    id: 'tw_unpaid_leave',
    name: '無薪假（減班休息）',
    category: 'career',
    description: '台灣特有的無薪假文化，景氣差時大量出現',
    baseProbability: 0.02,
    durationMonths: [2, 6],
    impacts: [
      { type: 'income_change', value: -0.25 },
    ],
    correlatedWith: ['tw_recession'],
  },
  {
    id: 'tw_career_break',
    name: '自願離職空窗',
    category: 'career',
    description: '台灣科技業平均2-3年換工作，空窗期1-3個月',
    baseProbability: 0.08,
    durationMonths: [1, 3],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
  },
  {
    id: 'tw_promotion',
    name: '升遷加薪',
    category: 'career',
    description: '重大升遷，薪資提升10-20%',
    baseProbability: 0.12,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.15, permanent: true },
      { type: 'savings_boost', value: 0.03 },
    ],
    isPositive: true,
  },
  {
    id: 'tw_job_hop',
    name: '跳槽加薪',
    category: 'career',
    description: '科技業跳槽加薪幅度常達20-30%',
    baseProbability: 0.10,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.15 },
      { minAge: 30, maxAge: 34, probability: 0.12 },
      { minAge: 35, maxAge: 39, probability: 0.10 },
      { minAge: 40, maxAge: 44, probability: 0.08 },
      { minAge: 45, maxAge: 49, probability: 0.05 },
      { minAge: 50, maxAge: 99, probability: 0.03 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.20, permanent: true },
      { type: 'savings_boost', value: 0.05 },
    ],
    isPositive: true,
  },
  {
    id: 'tw_burnout',
    name: '職業倦怠',
    category: 'career',
    description: '身心耗竭，需要強制休息',
    baseProbability: 0.06,
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.15 },
      { type: 'extra_expense', value: 0.3 },
    ],
    correlatedWith: ['tw_mental_health'],
  },
  {
    id: 'tw_company_bankrupt',
    name: '公司倒閉',
    category: 'career',
    description: '公司歇業，可申請積欠工資墊償基金+失業給付',
    baseProbability: 0.005,
    durationMonths: [3, 9],
    impacts: [
      { type: 'income_change', value: -0.40 },
      { type: 'savings_change', value: -0.05 },
    ],
    correlatedWith: ['tw_recession'],
  },

  // ================================================================
  // 醫療與健康（台灣版 — 全民健保大幅降低財務風險）
  // ================================================================
  {
    id: 'tw_short_illness',
    name: '短期傷病住院',
    category: 'health',
    description: '住院<30天，健保給付大部分費用',
    baseProbability: 0.08,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.05 },
      { minAge: 35, maxAge: 44, probability: 0.07 },
      { minAge: 45, maxAge: 54, probability: 0.10 },
      { minAge: 55, maxAge: 59, probability: 0.13 },
      { minAge: 60, maxAge: 99, probability: 0.16 },
    ],
    durationMonths: [0.5, 2],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 0.5 },  // 健保後自費1-5萬
    ],
  },
  {
    id: 'tw_critical_illness',
    name: '重大傷病（癌症等）',
    category: 'health',
    description: '重大傷病卡免部分負擔，但自費藥物/標靶仍昂貴',
    baseProbability: 0.005,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.001 },
      { minAge: 30, maxAge: 39, probability: 0.002 },
      { minAge: 40, maxAge: 49, probability: 0.005 },
      { minAge: 50, maxAge: 59, probability: 0.012 },
      { minAge: 60, maxAge: 99, probability: 0.025 },
    ],
    durationMonths: [6, 36],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'extra_expense', value: 2 },  // 自費藥物20-100萬
    ],
    correlatedWith: ['tw_long_disability'],
  },
  {
    id: 'tw_long_disability',
    name: '長期失能',
    category: 'health',
    description: '長期無法工作，可領勞保失能年金+長照2.0補助',
    baseProbability: 0.003,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.002 },
      { minAge: 35, maxAge: 44, probability: 0.003 },
      { minAge: 45, maxAge: 54, probability: 0.006 },
      { minAge: 55, maxAge: 59, probability: 0.012 },
      { minAge: 60, maxAge: 99, probability: 0.020 },
    ],
    durationMonths: [12, 60],
    impacts: [
      { type: 'income_change', value: -0.30 },  // 扣除勞保失能年金後
      { type: 'extra_expense', value: 2 },  // 看護費
    ],
    correlatedWith: ['tw_critical_illness'],
  },
  {
    id: 'tw_er_visit',
    name: '急診就醫',
    category: 'health',
    description: '健保給付大部分，部分負擔僅數百至數千元',
    baseProbability: 0.15,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.10 },
      { minAge: 35, maxAge: 44, probability: 0.13 },
      { minAge: 45, maxAge: 54, probability: 0.18 },
      { minAge: 55, maxAge: 59, probability: 0.22 },
      { minAge: 60, maxAge: 99, probability: 0.28 },
    ],
    durationMonths: [0.1, 0.5],
    impacts: [
      { type: 'extra_expense', value: 0.1 },  // 健保後僅500-5000
    ],
  },
  {
    id: 'tw_mental_health',
    name: '心理健康問題',
    category: 'health',
    description: '自費心理諮商2,000-4,000/次，健保精神科有限額',
    baseProbability: 0.08,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.10 },
      { minAge: 30, maxAge: 39, probability: 0.08 },
      { minAge: 40, maxAge: 49, probability: 0.06 },
      { minAge: 50, maxAge: 59, probability: 0.04 },
      { minAge: 60, maxAge: 99, probability: 0.03 },
    ],
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 0.5 },
    ],
    correlatedWith: ['tw_burnout', 'tw_layoff'],
  },

  // ================================================================
  // 家庭與人生（台灣版）
  // ================================================================
  {
    id: 'tw_marriage',
    name: '結婚',
    category: 'family',
    description: '台灣婚宴文化，禮金可部分抵消婚禮支出',
    baseProbability: 0.04,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.06 },
      { minAge: 30, maxAge: 34, probability: 0.06 },
      { minAge: 35, maxAge: 39, probability: 0.04 },
      { minAge: 40, maxAge: 44, probability: 0.02 },
      { minAge: 45, maxAge: 99, probability: 0.01 },
    ],
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 1.5 },  // 婚禮淨支出30-80萬(扣禮金)
      { type: 'income_boost', value: 0.05, permanent: true },
      { type: 'savings_boost', value: 0.08 },
    ],
    isPositive: true,
  },
  {
    id: 'tw_divorce',
    name: '離婚',
    category: 'family',
    description: '有偶離婚率10.5‰，婚後5年內最危險',
    baseProbability: 0.01,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.008 },
      { minAge: 30, maxAge: 34, probability: 0.012 },
      { minAge: 35, maxAge: 39, probability: 0.015 },
      { minAge: 40, maxAge: 44, probability: 0.012 },
      { minAge: 45, maxAge: 49, probability: 0.010 },
      { minAge: 50, maxAge: 54, probability: 0.008 },
      { minAge: 55, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'portfolio_change', value: -0.15 },
      { type: 'extra_expense', value: 1 },  // 律師費5-30萬
    ],
    correlatedWith: ['tw_mental_health'],
  },
  {
    id: 'tw_child_birth',
    name: '生育小孩',
    category: 'family',
    description: '政府生育補助6萬+地方補助；育兒津貼5,000/月',
    baseProbability: 0.025,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.03 },
      { minAge: 30, maxAge: 34, probability: 0.04 },
      { minAge: 35, maxAge: 39, probability: 0.03 },
      { minAge: 40, maxAge: 44, probability: 0.015 },
      { minAge: 45, maxAge: 99, probability: 0.002 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'extra_expense', value: 1.5 },  // 生產+初期費用(扣補助後)
      { type: 'savings_boost', value: -0.03, permanent: true },  // 月支出永久增加
    ],
  },
  {
    id: 'tw_parent_care',
    name: '父母需要照護',
    category: 'family',
    description: '三明治世代壓力，長照2.0有限補助，外籍看護月薪2-2.5萬',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 35, maxAge: 39, probability: 0.02 },
      { minAge: 40, maxAge: 44, probability: 0.03 },
      { minAge: 45, maxAge: 49, probability: 0.04 },
      { minAge: 50, maxAge: 54, probability: 0.05 },
      { minAge: 55, maxAge: 59, probability: 0.06 },
      { minAge: 60, maxAge: 99, probability: 0.04 },
    ],
    durationMonths: [12, 60],
    impacts: [
      { type: 'income_change', value: -0.08 },  // 需減少工時
      { type: 'extra_expense', value: 1.5 },  // 看護/安養費(扣長照補助)
    ],
  },
  {
    id: 'tw_family_death',
    name: '家人過世',
    category: 'family',
    description: '直系親屬過世，喪葬費15-50萬，奠儀可部分抵消',
    baseProbability: 0.005,
    durationMonths: [3, 6],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'tw_inheritance',
    name: '遺產繼承',
    category: 'family',
    description: '繼承遺產，遺產稅免稅額1,333萬',
    baseProbability: 0.005,
    durationMonths: [0, 0],
    impacts: [
      { type: 'savings_boost', value: 0.40 },
    ],
    isPositive: true,
  },
  {
    id: 'tw_purchase_home',
    name: '購屋',
    category: 'family',
    description: '六都房價中位數1,000-2,000萬，房貸所得比9-16倍',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.02 },
      { minAge: 30, maxAge: 34, probability: 0.04 },
      { minAge: 35, maxAge: 39, probability: 0.04 },
      { minAge: 40, maxAge: 44, probability: 0.03 },
      { minAge: 45, maxAge: 99, probability: 0.01 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'savings_change', value: -0.15 },  // 頭期款
      { type: 'savings_boost', value: -0.05, permanent: true },  // 房貸月付永久增加
    ],
  },

  // ================================================================
  // 財產與資產（台灣版 — 天災風險高）
  // ================================================================
  {
    id: 'tw_typhoon',
    name: '颱風造成損害',
    category: 'property',
    description: '台灣年均3-4個颱風侵襲，住宅保險投保率低',
    baseProbability: 0.02,
    durationMonths: [1, 6],
    impacts: [
      { type: 'savings_change', value: -0.02 },
      { type: 'extra_expense', value: 0.8 },
    ],
  },
  {
    id: 'tw_earthquake',
    name: '地震造成損害',
    category: 'property',
    description: '台灣位於環太平洋地震帶，地震險投保率低',
    baseProbability: 0.005,
    durationMonths: [3, 24],
    impacts: [
      { type: 'savings_change', value: -0.05 },
      { type: 'extra_expense', value: 2 },
    ],
  },
  {
    id: 'tw_car_accident',
    name: '車禍交通事故',
    category: 'property',
    description: '機車事故率高，強制險+任意險可覆蓋部分',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.04 },
      { minAge: 30, maxAge: 39, probability: 0.03 },
      { minAge: 40, maxAge: 49, probability: 0.025 },
      { minAge: 50, maxAge: 59, probability: 0.02 },
      { minAge: 60, maxAge: 99, probability: 0.015 },
    ],
    durationMonths: [0.5, 6],
    impacts: [
      { type: 'income_change', value: -0.03 },
      { type: 'extra_expense', value: 0.8 },
    ],
  },
  {
    id: 'tw_fraud',
    name: '詐騙受害',
    category: 'property',
    description: '台灣詐騙猖獗，投資詐騙/網路購物詐騙',
    baseProbability: 0.02,
    durationMonths: [1, 6],
    impacts: [
      { type: 'savings_change', value: -0.03 },
    ],
  },
  {
    id: 'tw_home_repair',
    name: '住宅重大維修',
    category: 'property',
    description: '老公寓管線/防水/電梯維修，大樓管委會特別費',
    baseProbability: 0.10,
    durationMonths: [0.5, 3],
    impacts: [
      { type: 'extra_expense', value: 0.8 },
    ],
  },
  {
    id: 'tw_rent_increase',
    name: '房東漲租/被迫搬遷',
    category: 'property',
    description: '租屋族風險，台灣租賃保障仍不足',
    baseProbability: 0.05,
    durationMonths: [1, 2],
    impacts: [
      { type: 'extra_expense', value: 0.5 },
    ],
  },

  // ================================================================
  // 法律與稅務（台灣版）
  // ================================================================
  {
    id: 'tw_tax_audit',
    name: '國稅局查稅',
    category: 'legal',
    description: '綜所稅/營所稅稽核，海外所得需注意',
    baseProbability: 0.003,
    durationMonths: [3, 12],
    impacts: [
      { type: 'savings_change', value: -0.02 },
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'tw_lawsuit',
    name: '法律訴訟',
    category: 'legal',
    description: '被告涉訟，律師費10-50萬+，可能耗時數年',
    baseProbability: 0.005,
    durationMonths: [6, 36],
    impacts: [
      { type: 'savings_change', value: -0.04 },
      { type: 'extra_expense', value: 1.5 },
    ],
  },
  {
    id: 'tw_tax_change',
    name: '不利稅法變動',
    category: 'legal',
    description: '稅率調整或免稅額縮減（如二代健保補充保費調漲）',
    baseProbability: 0.05,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_change', value: -0.02, permanent: true },
    ],
  },
]

export const EVENT_MAP_TW = new Map(EVENT_DATABASE_TW.map(e => [e.id, e]))

export const CATEGORY_LABELS_TW: Record<EventCategory, string> = {
  market: '市場與經濟',
  career: '職涯與就業',
  health: '醫療與健康',
  family: '家庭與人生',
  property: '財產與資產',
  legal: '法律與稅務',
}
