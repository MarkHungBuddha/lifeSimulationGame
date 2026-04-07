/**
 * 日本版隨機事件資料庫
 * 資料來源：monte_carlo_japan.md
 * 総務省統計局、厚生労働省、金融庁、日本銀行、国税庁、気象庁
 *
 * 與其他版關鍵差異：
 * - 失われた30年：日本株長期報酬遠低於美股
 * - 國民皆保險 + 高額療養費制度（月上限約8-9万円）
 * - 地震為最大固有風險（南海トラフ 30年内70-80%）
 * - 終身雇用崩壊中但正社員仍受高度保護
 * - 賞與依存度高（年收20-30%）
 * - 非正規雇用占37%
 */

import type { RandomEvent, EventCategory } from './eventTypes'

export const EVENT_DATABASE_JP: RandomEvent[] = [
  // ================================================================
  // 市場與經濟（日本版）
  // ================================================================
  {
    id: 'jp_market_crash',
    name: '日経暴落',
    category: 'market',
    description: '日経平均≥20%下落。歴史的に回復に数年〜34年かかることも',
    baseProbability: 0.10,
    durationMonths: [6, 36],
    impacts: [
      { type: 'portfolio_change', value: -0.075 },
    ],
    correlatedWith: ['jp_recession', 'jp_yen_spike'],
  },
  {
    id: 'jp_market_correction',
    name: '日経調整',
    category: 'market',
    description: '10-20%の調整。年に1-2回の10%調整は日常的',
    baseProbability: 0.14,
    durationMonths: [2, 12],
    impacts: [
      { type: 'portfolio_change', value: -0.025 },
    ],
  },
  {
    id: 'jp_recession',
    name: '景気後退',
    category: 'market',
    description: '日本は1991年以降低成長が常態化。景気後退で雇用にも影響',
    baseProbability: 0.08,
    durationMonths: [12, 24],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'portfolio_change', value: -0.05 },
    ],
    correlatedWith: ['jp_market_crash', 'jp_layoff', 'jp_bonus_cut'],
  },
  {
    id: 'jp_yen_spike',
    name: '急激な円高',
    category: 'market',
    description: '円高>10%。リスクオフ→円買い→株安のスパイラル',
    baseProbability: 0.05,
    durationMonths: [6, 24],
    impacts: [
      { type: 'portfolio_change', value: -0.06 },
    ],
    correlatedWith: ['jp_market_crash', 'jp_bonus_cut'],
  },
  {
    id: 'jp_yen_weak',
    name: '急激な円安',
    category: 'market',
    description: '円安>10%。輸入物価上昇→実質購買力低下',
    baseProbability: 0.05,
    durationMonths: [6, 24],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 0.5 },
    ],
  },
  {
    id: 'jp_inflation',
    name: 'インフレ(CPI>3%)',
    category: 'market',
    description: '30年ぶりの高インフレ。実質購買力が目減り',
    baseProbability: 0.05,
    durationMonths: [12, 36],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 0.6 },
    ],
  },
  {
    id: 'jp_boj_shock',
    name: 'BOJ政策変更ショック',
    category: 'market',
    description: '日銀の利上げ/政策変更→円高+株安+金利上昇の連鎖',
    baseProbability: 0.03,
    durationMonths: [1, 12],
    impacts: [
      { type: 'portfolio_change', value: -0.05 },
    ],
    correlatedWith: ['jp_yen_spike', 'jp_market_crash'],
  },

  // ================================================================
  // 職涯與雇用（日本版）
  // ================================================================
  {
    id: 'jp_layoff',
    name: '非自発的離職(リストラ)',
    category: 'career',
    description: '解雇・リストラ。雇用保険で給与50-80%、最長330日',
    baseProbability: 0.005,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.005 },
      { minAge: 35, maxAge: 44, probability: 0.004 },
      { minAge: 45, maxAge: 54, probability: 0.008 },
      { minAge: 55, maxAge: 59, probability: 0.010 },
      { minAge: 60, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.35 },
      { type: 'savings_change', value: -0.05 },
    ],
    correlatedWith: ['jp_recession', 'jp_mental_health'],
  },
  {
    id: 'jp_early_retirement',
    name: '早期退職勧奨',
    category: 'career',
    description: '肩たたき。割増退職金12-36ヶ月分が出るが再就職は困難',
    baseProbability: 0.01,
    ageProbabilities: [
      { minAge: 25, maxAge: 39, probability: 0.002 },
      { minAge: 40, maxAge: 49, probability: 0.010 },
      { minAge: 50, maxAge: 59, probability: 0.020 },
      { minAge: 60, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_change', value: -0.30 },
      { type: 'savings_boost', value: 0.20 },
    ],
  },
  {
    id: 'jp_job_change',
    name: '転職',
    category: 'career',
    description: '自発的転職。転職後の年収+10-20%',
    baseProbability: 0.045,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.07 },
      { minAge: 30, maxAge: 34, probability: 0.05 },
      { minAge: 35, maxAge: 39, probability: 0.04 },
      { minAge: 40, maxAge: 44, probability: 0.03 },
      { minAge: 45, maxAge: 49, probability: 0.02 },
      { minAge: 50, maxAge: 99, probability: 0.01 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.15, permanent: true },
      { type: 'savings_boost', value: 0.03 },
    ],
    isPositive: true,
  },
  {
    id: 'jp_promotion',
    name: '昇進・昇給',
    category: 'career',
    description: '重要な昇進。年功序列は崩壊傾向だが昇進で+10-15%',
    baseProbability: 0.08,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: 0.12, permanent: true },
      { type: 'savings_boost', value: 0.05 },
    ],
    isPositive: true,
  },
  {
    id: 'jp_bonus_cut',
    name: 'ボーナスカット',
    category: 'career',
    description: '賞与が業績連動で大幅カット。年収の20-30%を占める賞与の減額',
    baseProbability: 0.05,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
    correlatedWith: ['jp_recession'],
  },
  {
    id: 'jp_burnout',
    name: '過労・バーンアウト',
    category: 'career',
    description: '長時間労働による心身の限界。傷病手当金で標準報酬の2/3',
    baseProbability: 0.04,
    durationMonths: [1, 12],
    impacts: [
      { type: 'income_change', value: -0.20 },
      { type: 'extra_expense', value: 0.3 },
    ],
    correlatedWith: ['jp_mental_health'],
  },
  {
    id: 'jp_non_regular',
    name: '正規→非正規転落',
    category: 'career',
    description: '非正規雇用に転落。年収-30-50%、復帰は年2%の確率',
    baseProbability: 0.01,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_boost', value: -0.35, permanent: true },
      { type: 'savings_change', value: -0.10 },
    ],
    correlatedWith: ['jp_layoff'],
  },
  {
    id: 'jp_company_bankrupt',
    name: '会社倒産',
    category: 'career',
    description: '勤務先が倒産。未払賃金立替制度+雇用保険あり',
    baseProbability: 0.003,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.40 },
      { type: 'savings_change', value: -0.08 },
    ],
    correlatedWith: ['jp_recession'],
  },

  // ================================================================
  // 醫療與健康（日本版 — 国民皆保険+高額療養費）
  // ================================================================
  {
    id: 'jp_short_illness',
    name: '短期傷病(入院)',
    category: 'health',
    description: '入院<30日。高額療養費で月8-9万円上限',
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
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'jp_critical_illness',
    name: '重大疾病(がん等)',
    category: 'health',
    description: '先進医療・自由診療は高額療養費対象外。自費30-200万円',
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
      { type: 'income_change', value: -0.25 },
      { type: 'extra_expense', value: 1.5 },
    ],
    correlatedWith: ['jp_long_disability'],
  },
  {
    id: 'jp_long_disability',
    name: '長期障害',
    category: 'health',
    description: '障害年金(1-2級 月6.5-8.1万円)+介護費',
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
      { type: 'income_change', value: -0.30 },
      { type: 'extra_expense', value: 1.5 },
    ],
    correlatedWith: ['jp_critical_illness'],
  },
  {
    id: 'jp_er_visit',
    name: '救急搬送',
    category: 'health',
    description: '救急車無料（日本の特徴）。健保適用で自己負担は少額',
    baseProbability: 0.10,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.06 },
      { minAge: 35, maxAge: 44, probability: 0.08 },
      { minAge: 45, maxAge: 54, probability: 0.12 },
      { minAge: 55, maxAge: 59, probability: 0.16 },
      { minAge: 60, maxAge: 99, probability: 0.22 },
    ],
    durationMonths: [0.1, 0.5],
    impacts: [
      { type: 'extra_expense', value: 0.1 },
    ],
  },
  {
    id: 'jp_mental_health',
    name: 'メンタルヘルス問題',
    category: 'health',
    description: 'カウンセリング5,000-10,000円/回。自立支援医療で1割負担に軽減可',
    baseProbability: 0.08,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.10 },
      { minAge: 30, maxAge: 39, probability: 0.08 },
      { minAge: 40, maxAge: 49, probability: 0.06 },
      { minAge: 50, maxAge: 59, probability: 0.04 },
      { minAge: 60, maxAge: 99, probability: 0.03 },
    ],
    durationMonths: [3, 24],
    impacts: [
      { type: 'income_change', value: -0.08 },
      { type: 'extra_expense', value: 0.4 },
    ],
    correlatedWith: ['jp_burnout', 'jp_layoff'],
  },
  {
    id: 'jp_karoshi_health',
    name: '過労による健康被害',
    category: 'health',
    description: '労災認定なら医療費全額+休業補償60%+特別支給金20%',
    baseProbability: 0.02,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.15 },
      { type: 'extra_expense', value: 0.5 },
    ],
    correlatedWith: ['jp_burnout'],
  },

  // ================================================================
  // 家庭與人生（日本版）
  // ================================================================
  {
    id: 'jp_marriage',
    name: '結婚',
    category: 'family',
    description: '挙式費用平均303万円。ご祝儀で30-50%回収',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.04 },
      { minAge: 30, maxAge: 34, probability: 0.05 },
      { minAge: 35, maxAge: 39, probability: 0.03 },
      { minAge: 40, maxAge: 44, probability: 0.015 },
      { minAge: 45, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 1.5 },
      { type: 'income_boost', value: 0.03, permanent: true },
      { type: 'savings_boost', value: 0.05 },
    ],
    isPositive: true,
    correlatedWith: ['jp_purchase_home'],
  },
  {
    id: 'jp_divorce',
    name: '離婚',
    category: 'family',
    description: '協議離婚85%。財産分与+慰謝料。熟年離婚は年金分割あり',
    baseProbability: 0.008,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.006 },
      { minAge: 30, maxAge: 34, probability: 0.010 },
      { minAge: 35, maxAge: 39, probability: 0.012 },
      { minAge: 40, maxAge: 44, probability: 0.010 },
      { minAge: 45, maxAge: 49, probability: 0.008 },
      { minAge: 50, maxAge: 54, probability: 0.006 },
      { minAge: 55, maxAge: 99, probability: 0.005 },
    ],
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.05 },
      { type: 'portfolio_change', value: -0.15 },
      { type: 'extra_expense', value: 0.8 },
    ],
    correlatedWith: ['jp_mental_health'],
  },
  {
    id: 'jp_child_birth',
    name: '出産',
    category: 'family',
    description: '出産一時金50万円でほぼ相殺。児童手当1-1.5万/月',
    baseProbability: 0.02,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.025 },
      { minAge: 30, maxAge: 34, probability: 0.035 },
      { minAge: 35, maxAge: 39, probability: 0.025 },
      { minAge: 40, maxAge: 44, probability: 0.010 },
      { minAge: 45, maxAge: 99, probability: 0.001 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'savings_boost', value: -0.03, permanent: true },
    ],
  },
  {
    id: 'jp_parent_care',
    name: '親の介護開始',
    category: 'family',
    description: '介護保険自己負担1-3割。介護離職年間約10万人',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 35, maxAge: 39, probability: 0.02 },
      { minAge: 40, maxAge: 44, probability: 0.03 },
      { minAge: 45, maxAge: 49, probability: 0.04 },
      { minAge: 50, maxAge: 54, probability: 0.05 },
      { minAge: 55, maxAge: 59, probability: 0.07 },
      { minAge: 60, maxAge: 99, probability: 0.05 },
    ],
    durationMonths: [12, 60],
    impacts: [
      { type: 'income_change', value: -0.10 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'jp_family_death',
    name: '家族の死亡',
    category: 'family',
    description: '直系親族の死亡。葬儀費用平均約200万円',
    baseProbability: 0.005,
    durationMonths: [3, 6],
    impacts: [
      { type: 'income_change', value: -0.03 },
      { type: 'extra_expense', value: 0.8 },
    ],
  },
  {
    id: 'jp_inheritance',
    name: '相続',
    category: 'family',
    description: '相続額中央値約2,000-3,000万円。基礎控除3,600万+600万×法定相続人数',
    baseProbability: 0.01,
    durationMonths: [0, 0],
    impacts: [
      { type: 'savings_boost', value: 0.40 },
    ],
    isPositive: true,
  },
  {
    id: 'jp_purchase_home',
    name: '住宅購入',
    category: 'family',
    description: '首都圏新築マンション平均7,566万円。頭金500-1,500万',
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
      { type: 'savings_change', value: -0.15 },
      { type: 'savings_boost', value: -0.05, permanent: true },
    ],
  },

  // ================================================================
  // 財産・天災（日本版 — 地震リスク極高）
  // ================================================================
  {
    id: 'jp_major_earthquake',
    name: '大地震で直接被害',
    category: 'property',
    description: '南海トラフ30年以内70-80%。地震保険加入率35%',
    baseProbability: 0.005,
    durationMonths: [6, 60],
    impacts: [
      { type: 'savings_change', value: -0.10 },
      { type: 'extra_expense', value: 2 },
    ],
    correlatedWith: ['jp_market_crash'],
    ownerProbabilityMultiplier: 2.5,
    ownerExtraImpacts: [
      { type: 'extra_expense', value: 4 },
    ],
  },
  {
    id: 'jp_earthquake_indirect',
    name: '地震間接被害(停電・物流)',
    category: 'property',
    description: '直接被害がなくても生活に影響',
    baseProbability: 0.02,
    durationMonths: [0.5, 3],
    impacts: [
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'jp_typhoon',
    name: '台風・豪雨被害',
    category: 'property',
    description: '年間3-4個の台風上陸。10-200万円の損害',
    baseProbability: 0.015,
    durationMonths: [1, 6],
    impacts: [
      { type: 'savings_change', value: -0.02 },
      { type: 'extra_expense', value: 0.6 },
    ],
    ownerProbabilityMultiplier: 1.5,
    ownerExtraImpacts: [
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'jp_car_accident',
    name: '交通事故',
    category: 'property',
    description: '自動車保険は高カバー。修理費+医療費5-50万',
    baseProbability: 0.02,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.03 },
      { minAge: 30, maxAge: 39, probability: 0.02 },
      { minAge: 40, maxAge: 49, probability: 0.018 },
      { minAge: 50, maxAge: 59, probability: 0.015 },
      { minAge: 60, maxAge: 99, probability: 0.012 },
    ],
    durationMonths: [0.5, 6],
    impacts: [
      { type: 'income_change', value: -0.03 },
      { type: 'extra_expense', value: 0.5 },
    ],
  },
  {
    id: 'jp_fraud',
    name: '詐欺被害',
    category: 'property',
    description: '特殊詐欺(オレオレ詐欺等)。高齢者が特に被害大',
    baseProbability: 0.015,
    ageProbabilities: [
      { minAge: 25, maxAge: 39, probability: 0.01 },
      { minAge: 40, maxAge: 54, probability: 0.015 },
      { minAge: 55, maxAge: 59, probability: 0.02 },
      { minAge: 60, maxAge: 99, probability: 0.03 },
    ],
    durationMonths: [1, 6],
    impacts: [
      { type: 'savings_change', value: -0.04 },
    ],
  },
  {
    id: 'jp_home_repair',
    name: '住宅大規模修繕',
    category: 'property',
    description: 'マンション修繕積立金不足・一戸建て屋根外壁修繕',
    baseProbability: 0.08,
    durationMonths: [0.5, 3],
    impacts: [
      { type: 'extra_expense', value: 0.6 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'jp_rent_increase',
    name: '家賃値上げ・更新料',
    category: 'property',
    description: '都市部で上昇傾向。更新料1-2ヶ月分は日本固有',
    baseProbability: 0.05,
    durationMonths: [1, 2],
    impacts: [
      { type: 'extra_expense', value: 0.4 },
    ],
    housingCondition: 'renter_only',
  },

  {
    id: 'jp_boj_rate_shock',
    name: 'BOJ利上げで住宅ローン増',
    category: 'property',
    description: '80%が変動金利。BOJ利上げ→月額返済+20-30%の衝撃',
    baseProbability: 0.10,
    durationMonths: [12, 36],
    impacts: [
      { type: 'extra_expense', value: 1.5 },
    ],
    housingCondition: 'owner_only',
    correlatedWith: ['jp_boj_shock'],
  },
  {
    id: 'jp_mansion_repair_fund_shortage',
    name: '修繕積立金不足',
    category: 'property',
    description: '築古マンションの修繕積立金不足が社会問題化。一時金徴収',
    baseProbability: 0.05,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 1.5 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'jp_property_revaluation',
    name: '固定資産税評価額見直し',
    category: 'property',
    description: '3年ごとの評価替えで固定資産税が増加',
    baseProbability: 0.02,
    durationMonths: [0, 0],
    impacts: [
      { type: 'extra_expense', value: 0.5 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'jp_building_depreciation',
    name: '建物老朽化問題',
    category: 'property',
    description: '木造22年・RC47年の法定耐用年限。建物価値が大幅に下落',
    baseProbability: 0.03,
    ageProbabilities: [
      { minAge: 25, maxAge: 39, probability: 0.01 },
      { minAge: 40, maxAge: 49, probability: 0.02 },
      { minAge: 50, maxAge: 59, probability: 0.04 },
      { minAge: 60, maxAge: 99, probability: 0.05 },
    ],
    durationMonths: [0, 0],
    impacts: [
      { type: 'portfolio_change', value: -0.03 },
    ],
    housingCondition: 'owner_only',
  },
  {
    id: 'jp_neighbor_issue',
    name: '近隣トラブル',
    category: 'property',
    description: '騒音・ゴミ・マナー問題。マンションでは管理組合で対応',
    baseProbability: 0.03,
    durationMonths: [6, 24],
    impacts: [
      { type: 'extra_expense', value: 0.3 },
    ],
    housingCondition: 'owner_only',
  },

  // ================================================================
  // 法律與稅務（日本版）
  // ================================================================
  {
    id: 'jp_tax_audit',
    name: '税務調査',
    category: 'legal',
    description: '追徴税+加算税。国税庁の調査率は低下中',
    baseProbability: 0.003,
    durationMonths: [3, 12],
    impacts: [
      { type: 'savings_change', value: -0.02 },
      { type: 'extra_expense', value: 0.3 },
    ],
  },
  {
    id: 'jp_lawsuit',
    name: '訴訟(被告)',
    category: 'legal',
    description: '弁護士費用50-200万円。日本は訴訟社会ではないが増加傾向',
    baseProbability: 0.003,
    durationMonths: [6, 36],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'jp_pension_cut',
    name: '年金制度変更',
    category: 'legal',
    description: 'マクロ経済スライドで実質減額傾向。将来の年金額-5~15%',
    baseProbability: 0.03,
    durationMonths: [0, 0],
    impacts: [
      { type: 'income_change', value: -0.02, permanent: true },
    ],
  },

  // ================================================================
  // 職業専属イベント（日本版）
  // ================================================================

  // --- 管理的職業従事者 (id: 1) ---
  {
    id: 'jp_occ1_yakuin_bonus',
    name: '役員賞与',
    category: 'career',
    description: '業績好調により、取締役賞与が支給された。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [1],
  },
  {
    id: 'jp_occ1_restructure',
    name: '組織再編・降格',
    category: 'career',
    description: '会社の組織再編により、ポストが削減された。',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [1],
  },
  {
    id: 'jp_occ1_mna',
    name: 'M&Aによる報奨',
    category: 'career',
    description: '担当したM&A案件が成功し、特別報奨金を受け取った。',
    baseProbability: 0.02,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.12 },
    ],
    isPositive: true,
    occupationIds: [1],
  },

  // --- 専門的・技術的職業従事者 (id: 2) ---
  {
    id: 'jp_occ2_patent',
    name: '特許取得・論文発表',
    category: 'career',
    description: '研究成果が特許として認められ、会社から報奨金が支給された。',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.04 },
      { type: 'income_boost', value: 0.04 },
    ],
    isPositive: true,
    occupationIds: [2],
  },
  {
    id: 'jp_occ2_iryou_jiko',
    name: '医療事故・専門家責任',
    category: 'legal',
    description: '医療事故や専門家責任を問われ、訴訟費用が発生。',
    baseProbability: 0.02,
    ageProbabilities: [
      { minAge: 35, maxAge: 60, probability: 0.03 },
    ],
    durationMonths: [6, 24],
    impacts: [
      { type: 'extra_expense', value: 6 },
    ],
    occupationIds: [2],
  },
  {
    id: 'jp_occ2_shikaku',
    name: '国家資格取得',
    category: 'career',
    description: '難関国家資格に合格し、市場価値が大幅にアップ。',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.07 },
    ],
    isPositive: true,
    occupationIds: [2],
  },

  // --- 事務従事者 (id: 3) ---
  {
    id: 'jp_occ3_rpa',
    name: 'RPA導入による業務縮小',
    category: 'career',
    description: '会社がRPA・AIを導入し、事務職のポストが減少。',
    baseProbability: 0.05,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [3],
  },
  {
    id: 'jp_occ3_kaizen',
    name: '業務改善提案採用',
    category: 'career',
    description: '提案した業務改善が採用され、表彰と金一封を受けた。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.02 },
    ],
    isPositive: true,
    occupationIds: [3],
  },
  {
    id: 'jp_occ3_haken',
    name: '派遣切り',
    category: 'career',
    description: '景気悪化で派遣契約を打ち切られた。',
    baseProbability: 0.04,
    durationMonths: [2, 8],
    impacts: [
      { type: 'income_change', value: -0.25 },
    ],
    occupationIds: [3],
  },

  // --- サービス職業従事者 (id: 4) ---
  {
    id: 'jp_occ4_inbound_boom',
    name: 'インバウンド特需',
    category: 'career',
    description: '訪日外国人観光客の急増で、サービス業の売上が好調。',
    baseProbability: 0.05,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [4],
  },
  {
    id: 'jp_occ4_jinzai_busoku',
    name: '人手不足による待遇改善',
    category: 'career',
    description: '深刻な人手不足で時給・待遇が改善された。',
    baseProbability: 0.05,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.04 },
    ],
    isPositive: true,
    occupationIds: [4],
  },
  {
    id: 'jp_occ4_kustomer_claim',
    name: 'カスハラ被害',
    category: 'health',
    description: '悪質なカスタマーハラスメントで精神的ダメージを受けた。',
    baseProbability: 0.04,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.05 },
    ],
    occupationIds: [4],
  },

  // --- 生産工程・技能職 (id: 5) ---
  {
    id: 'jp_occ5_ginou_kentei',
    name: '技能検定合格',
    category: 'career',
    description: '国家技能検定に合格し、技能手当が付いた。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.05 },
    ],
    isPositive: true,
    occupationIds: [5],
  },
  {
    id: 'jp_occ5_rousai',
    name: '労災事故',
    category: 'health',
    description: '工場で労災事故に遭い、休業が必要になった。',
    baseProbability: 0.03,
    durationMonths: [2, 8],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'income_change', value: -0.12 },
    ],
    occupationIds: [5, 7, 8],
  },
  {
    id: 'jp_occ5_kaigai_iten',
    name: '工場の海外移転',
    category: 'career',
    description: '生産拠点が東南アジアに移転し、リストラ対象に。',
    baseProbability: 0.03,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.20 },
    ],
    occupationIds: [5, 7],
  },

  // --- 保安職業従事者 (id: 6) ---
  {
    id: 'jp_occ6_kiken_teate',
    name: '危険手当支給',
    category: 'career',
    description: '災害派遣や危険任務への従事により、特別手当が支給された。',
    baseProbability: 0.05,
    durationMonths: [1, 6],
    impacts: [
      { type: 'income_change', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [6],
  },
  {
    id: 'jp_occ6_saigai_haken',
    name: '災害派遣疲労',
    category: 'health',
    description: '大規模災害派遣で過度な疲労が蓄積し、体調を崩した。',
    baseProbability: 0.04,
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.05 },
    ],
    occupationIds: [6],
  },
  {
    id: 'jp_occ6_shoushin',
    name: '階級昇進',
    category: 'career',
    description: '試験に合格し階級が上がった。給与もアップ。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.06 },
    ],
    isPositive: true,
    occupationIds: [6],
  },

  // --- 輸送・機械運転従事者 (id: 7) ---
  {
    id: 'jp_occ7_2024_mondai',
    name: '2024年問題・人手不足',
    category: 'career',
    description: '物流の2024年問題で人手不足が深刻化し、待遇が改善された。',
    baseProbability: 0.05,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [7],
  },
  {
    id: 'jp_occ7_jiko',
    name: '運転中の事故',
    category: 'health',
    description: '業務中の交通事故で負傷。休業が必要に。',
    baseProbability: 0.04,
    durationMonths: [2, 8],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'income_change', value: -0.15 },
    ],
    occupationIds: [7],
  },
  {
    id: 'jp_occ7_jidou_unten',
    name: '自動運転技術の脅威',
    category: 'career',
    description: '自動運転技術の進展で、将来の雇用不安が増大。',
    baseProbability: 0.03,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.06 },
    ],
    occupationIds: [7],
  },

  // --- 建設・採掘従事者 (id: 8) ---
  {
    id: 'jp_occ8_olympics_demand',
    name: '大型公共工事',
    category: 'career',
    description: '万博やインフラ整備で建設需要が急増。',
    baseProbability: 0.04,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [8],
  },
  {
    id: 'jp_occ8_netchushou',
    name: '熱中症で入院',
    category: 'health',
    description: '屋外作業中に熱中症で倒れ、入院治療が必要に。',
    baseProbability: 0.04,
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.08 },
    ],
    occupationIds: [8],
  },
  {
    id: 'jp_occ8_saitech_bonus',
    name: '技能士手当',
    category: 'career',
    description: '建設業技能者として資格を取得し、手当がついた。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.04 },
    ],
    isPositive: true,
    occupationIds: [8],
  },

  // --- 情報通信技術者 (id: 9) ---
  {
    id: 'jp_occ9_stock_options',
    name: 'ストックオプション行使',
    category: 'career',
    description: '所属企業の株価上昇でストックオプションが大幅に増値。',
    baseProbability: 0.04,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.08 },
    ],
    isPositive: true,
    occupationIds: [9],
  },
  {
    id: 'jp_occ9_gafa_offer',
    name: '外資IT企業からオファー',
    category: 'career',
    description: 'GAFAMからヘッドハンティングを受け、大幅年収アップ。',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.15 },
    ],
    isPositive: true,
    occupationIds: [9],
  },
  {
    id: 'jp_occ9_deathmarch',
    name: 'デスマーチプロジェクト',
    category: 'health',
    description: '炎上プロジェクトで長時間労働が続き、心身を壊した。',
    baseProbability: 0.04,
    durationMonths: [3, 12],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'income_change', value: -0.10 },
    ],
    occupationIds: [9],
  },
  {
    id: 'jp_occ9_freelance',
    name: 'フリーランス転身',
    category: 'career',
    description: 'フリーランスに転身し、高単価案件を獲得。',
    baseProbability: 0.03,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.10 },
    ],
    isPositive: true,
    occupationIds: [9],
  },

  // --- 運搬・清掃・包装等従事者 (id: 10) ---
  {
    id: 'jp_occ10_saitei_chingin',
    name: '最低賃金引上げ',
    category: 'career',
    description: '最低賃金の引上げにより、時給が改善された。',
    baseProbability: 0.06,
    durationMonths: [1, 1],
    impacts: [
      { type: 'income_boost', value: 0.03 },
    ],
    isPositive: true,
    occupationIds: [10],
  },
  {
    id: 'jp_occ10_taijin_jiko',
    name: '作業中の怪我',
    category: 'health',
    description: '重量物の運搬中に腰を痛め、休業が必要に。',
    baseProbability: 0.05,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.10 },
    ],
    occupationIds: [10],
  },
  {
    id: 'jp_occ10_robot_threat',
    name: 'ロボット化の脅威',
    category: 'career',
    description: '倉庫や清掃のロボット化が進み、雇用不安が増大。',
    baseProbability: 0.04,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.06 },
    ],
    occupationIds: [10],
  },
]

export const EVENT_MAP_JP = new Map(EVENT_DATABASE_JP.map(e => [e.id, e]))

export const CATEGORY_LABELS_JP: Record<EventCategory, string> = {
  market: '市場・経済',
  career: 'キャリア・雇用',
  health: '医療・健康',
  family: '家庭・人生',
  property: '財産・天災',
  legal: '法律・税務',
  immigration: '移民関連',
}
