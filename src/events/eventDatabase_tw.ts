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
    ownerProbabilityMultiplier: 1.5,
    ownerExtraImpacts: [
      { type: 'portfolio_change', value: -0.05 },
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
    ownerProbabilityMultiplier: 1.5,
    ownerExtraImpacts: [
      { type: 'extra_expense', value: 1.5 },
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
    ownerProbabilityMultiplier: 2.0,
    ownerExtraImpacts: [
      { type: 'extra_expense', value: 3 },
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
    housingCondition: 'owner_only',
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
    housingCondition: 'renter_only',
  },

  {
    id: 'tw_credit_tightening',
    name: '央行信用管制/打房',
    category: 'property',
    description: '央行選擇性信用管制，第二戶限貸、利率加碼',
    baseProbability: 0.05,
    durationMonths: [12, 36],
    impacts: [
      { type: 'extra_expense', value: 0.5 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'tw_mortgage_rate_increase',
    name: '房貸利率上升',
    category: 'property',
    description: '央行升息，機動利率房貸月付增加 10-15%',
    baseProbability: 0.10,
    durationMonths: [12, 36],
    impacts: [
      { type: 'extra_expense', value: 1 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'tw_building_special_levy',
    name: '大樓管委會特別決議',
    category: 'property',
    description: '外牆/電梯/消防設備大修，需一次性繳納特別費',
    baseProbability: 0.03,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 1.5 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'tw_neighbor_issue',
    name: '鄰居/社區問題',
    category: 'property',
    description: '噪音、漏水糾紛、嫌惡設施，影響生活品質',
    baseProbability: 0.03,
    durationMonths: [6, 24],
    impacts: [
      { type: 'extra_expense', value: 0.3 },
    ],
    housingCondition: 'owner_only',
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

  // ================================================================
  // 職業專屬事件（台灣版）
  // ================================================================

  // --- 主管及經理人員 (id: 1) ---
  {
    id: 'tw_occ1_board_bonus',
    name: '董事會績效獎金',
    category: 'career',
    description: '公司業績亮眼，董事會核發高額績效獎金。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [1],
  },
  {
    id: 'tw_occ1_restructure',
    name: '組織重整降職',
    category: 'career',
    description: '公司進行組織重整，你的職位被調整，薪資連帶受影響。',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [1],
  },
  {
    id: 'tw_occ1_ipo',
    name: '公司 IPO 上市',
    category: 'career',
    description: '你任職的公司成功 IPO，手中持股大幅增值。',
    baseProbability: 0.02,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.15 },
    ],
    isPositive: true,
    occupationIds: [1],
  },

  // --- 專業人員 (id: 2) ---
  {
    id: 'tw_occ2_patent',
    name: '取得專利/重大發表',
    category: 'career',
    description: '你的研究成果獲得專利，公司給予獎金肯定。',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.05 },
      { type: 'income_boost', value: 0.05 },
    ],
    isPositive: true,
    occupationIds: [2],
  },
  {
    id: 'tw_occ2_malpractice',
    name: '專業責任糾紛',
    category: 'legal',
    description: '客戶/病患投訴，你面臨專業責任調查和律師費支出。',
    baseProbability: 0.02,
    ageProbabilities: [
      { minAge: 35, maxAge: 60, probability: 0.03 },
    ],
    durationMonths: [6, 18],
    impacts: [
      { type: 'extra_expense', value: 6 },
      { type: 'income_change', value: -0.10 },
    ],
    occupationIds: [2],
  },
  {
    id: 'tw_occ2_certification',
    name: '取得高階證照',
    category: 'career',
    description: '通過高階專業證照考試，市場價值大增。',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [2],
  },

  // --- 事務工作人員 (id: 3) ---
  {
    id: 'tw_occ3_automation',
    name: '業務自動化威脅',
    category: 'career',
    description: '公司導入 AI/RPA 自動化，你的職務內容被部分取代。',
    baseProbability: 0.04,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [3],
  },
  {
    id: 'tw_occ3_efficiency_bonus',
    name: '流程改善獎勵',
    category: 'career',
    description: '你提出的流程改善方案被採納，獲得特別獎金。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.03 },
    ],
    isPositive: true,
    occupationIds: [3],
  },
  {
    id: 'tw_occ3_outsource',
    name: '業務外包裁撤',
    category: 'career',
    description: '公司將行政業務外包，你面臨裁撤風險。',
    baseProbability: 0.03,
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: -0.20 },
    ],
    occupationIds: [3],
  },

  // --- 服務及銷售人員 (id: 4) ---
  {
    id: 'tw_occ4_top_sales',
    name: '業績 MVP 獎',
    category: 'career',
    description: '年度業績衝上冠軍，獲得豐厚提成獎金。',
    baseProbability: 0.05,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [4],
  },
  {
    id: 'tw_occ4_ecommerce_hit',
    name: '電商衝擊實體店',
    category: 'career',
    description: '線上購物搶走客源，門市業績大幅下滑。',
    baseProbability: 0.05,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.12 },
    ],
    occupationIds: [4],
  },
  {
    id: 'tw_occ4_customer_complaint',
    name: '客訴糾紛',
    category: 'legal',
    description: '重大客訴導致你被記過，影響考績。',
    baseProbability: 0.04,
    durationMonths: [1, 3],
    impacts: [
      { type: 'income_change', value: -0.05 },
    ],
    occupationIds: [4],
  },

  // --- 技術員及助理專業人員 (id: 5) ---
  {
    id: 'tw_occ5_skill_upgrade',
    name: '技術升級加薪',
    category: 'career',
    description: '學會新技術/設備操作，公司調薪獎勵。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.05 },
    ],
    isPositive: true,
    occupationIds: [5],
  },
  {
    id: 'tw_occ5_equipment_accident',
    name: '設備操作意外',
    category: 'health',
    description: '操作設備時發生意外，需要休養一段時間。',
    baseProbability: 0.03,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'income_change', value: -0.10 },
    ],
    occupationIds: [5, 7, 8],
  },
  {
    id: 'tw_occ5_outsource_overseas',
    name: '產線外移東南亞',
    category: 'career',
    description: '公司將生產線外移，技術人員面臨轉職壓力。',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [5, 7],
  },

  // --- 農林漁牧業 (id: 6) ---
  {
    id: 'tw_occ6_harvest_boom',
    name: '豐收好年',
    category: 'career',
    description: '今年氣候條件絕佳，農作豐收價格也好。',
    baseProbability: 0.06,
    durationMonths: [3, 6],
    impacts: [
      { type: 'savings_boost', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [6],
  },
  {
    id: 'tw_occ6_typhoon_damage',
    name: '颱風農損',
    category: 'property',
    description: '颱風重創農田/漁場，損失慘重。',
    baseProbability: 0.08,
    durationMonths: [2, 6],
    impacts: [
      { type: 'extra_expense', value: 4 },
      { type: 'income_change', value: -0.25 },
    ],
    occupationIds: [6],
  },
  {
    id: 'tw_occ6_subsidy',
    name: '政府農業補助',
    category: 'career',
    description: '申請到農委會的農業補助款。',
    baseProbability: 0.05,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.03 },
    ],
    isPositive: true,
    occupationIds: [6],
  },

  // --- 機械設備操作及組裝 (id: 7) ---
  {
    id: 'tw_occ7_overtime_bonus',
    name: '旺季加班獎金',
    category: 'career',
    description: '訂單爆量，加班費和獎金讓收入大增。',
    baseProbability: 0.06,
    durationMonths: [2, 4],
    impacts: [
      { type: 'savings_boost', value: 0.04 },
    ],
    isPositive: true,
    occupationIds: [7, 8],
  },
  {
    id: 'tw_occ7_factory_close',
    name: '工廠關廠',
    category: 'career',
    description: '工廠因訂單銳減或經營不善而關廠，你被資遣。',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.30 },
    ],
    occupationIds: [7, 8],
  },
  {
    id: 'tw_occ7_injury',
    name: '職業傷害',
    category: 'health',
    description: '工作中受傷，需要長時間復健。',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'extra_expense', value: 3 },
      { type: 'income_change', value: -0.20 },
    ],
    occupationIds: [7, 8],
  },

  // --- 基層技術工及勞力工 (id: 8) ---
  {
    id: 'tw_occ8_minimum_wage_raise',
    name: '基本工資調漲',
    category: 'career',
    description: '政府宣布調高基本工資，你的薪水跟著微調。',
    baseProbability: 0.06,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.03 },
    ],
    isPositive: true,
    occupationIds: [8],
  },
  {
    id: 'tw_occ8_construction_boom',
    name: '營建景氣大好',
    category: 'career',
    description: '公共工程標案大增，工地需求旺盛。',
    baseProbability: 0.05,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [8],
  },
  {
    id: 'tw_occ8_heat_illness',
    name: '高溫中暑住院',
    category: 'health',
    description: '戶外高溫作業導致嚴重中暑，需要住院治療。',
    baseProbability: 0.03,
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [8],
  },

  // --- 資訊科技人員 (id: 9) ---
  {
    id: 'tw_occ9_stock_options',
    name: '科技公司股票分紅',
    category: 'career',
    description: '公司股價大漲，你的限制型股票大幅增值。',
    baseProbability: 0.05,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [9],
  },
  {
    id: 'tw_occ9_ai_disruption',
    name: 'AI 取代部分工作',
    category: 'career',
    description: 'AI 工具快速進步，部分程式碼撰寫工作被自動化。',
    baseProbability: 0.04,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [9],
  },
  {
    id: 'tw_occ9_startup_bonus',
    name: '新創公司挖角',
    category: 'career',
    description: '新創公司高薪挖角，跳槽後薪水大幅成長。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.12 },
    ],
    isPositive: true,
    occupationIds: [9],
  },
  {
    id: 'tw_occ9_open_source_fame',
    name: '開源專案爆紅',
    category: 'career',
    description: '你維護的開源專案被大公司採用，業界知名度暴增。',
    baseProbability: 0.02,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [9],
  },

  // --- 軍人 (id: 10) ---
  {
    id: 'tw_occ10_combat_pay',
    name: '戰備加給',
    category: 'career',
    description: '因應台海情勢升溫，國防部發放戰備加給。',
    baseProbability: 0.04,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [10],
  },
  {
    id: 'tw_occ10_training_injury',
    name: '演訓受傷',
    category: 'health',
    description: '軍事演訓中受傷，需要住院休養。',
    baseProbability: 0.04,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.05 },
    ],
    occupationIds: [10],
  },
  {
    id: 'tw_occ10_early_pension',
    name: '軍職退撫金',
    category: 'career',
    description: '服役滿20年可領終身俸，退休生活有保障。',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 40, maxAge: 50, probability: 0.08 },
    ],
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [10],
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
  immigration: '移民相關',
}
