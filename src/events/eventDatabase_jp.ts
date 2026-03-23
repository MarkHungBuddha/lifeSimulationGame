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
      { type: 'portfolio_change', value: -0.15 },
    ],
    correlatedWith: ['jp_recession', 'jp_yen_spike'],
  },
  {
    id: 'jp_market_correction',
    name: '日経調整',
    category: 'market',
    description: '10-20%の調整。年に1-2回の10%調整は日常的',
    baseProbability: 0.20,
    durationMonths: [2, 12],
    impacts: [
      { type: 'portfolio_change', value: -0.05 },
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
      { type: 'portfolio_change', value: -0.10 },
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
      { type: 'portfolio_change', value: -0.10 },
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
    baseProbability: 0.05,
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
