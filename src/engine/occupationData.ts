/**
 * 職業靜態資料
 *
 * 資料來源：
 * - 台灣：勞動部 113 年職類別薪資調查年薪欄位
 * - 美國：BLS OEWS May 2024 Median Annual Wage
 * - 日本：厚生勞動省令和6年賃金構造基本統計調查 推估年收
 */

import type { OccupationDef } from './occupationTypes'

export const OCCUPATIONS: OccupationDef[] = [
  {
    id: 1,
    name: { us: 'Management', tw: '主管及經理人員', jp: '管理的職業従事者' },
    emoji: '👔',
    description: {
      us: 'CEO, Project Managers, HR/Finance Directors',
      tw: '高階主管、中階經理人、政府官員',
      jp: '企業董事、部長/課長、公部門管理職',
    },
    baseSalary: { us: 122_090, tw: 1_252_000, jp: 9_170_000 },
    raiseRange: { us: [0.035, 0.050], tw: [0.030, 0.050], jp: [0.030, 0.045] },
    ageRaiseFactor: { youngBoost: 1.2, midFactor: 1.0, seniorFactor: 0.7 },
    eventIds: [],
  },
  {
    id: 2,
    name: { us: 'Professional', tw: '專業人員', jp: '専門的・技術的職業従事者' },
    emoji: '⚕️',
    description: {
      us: 'Engineers, Doctors, Lawyers, Accountants, Scientists',
      tw: '工程師、醫師、律師、會計師、研究員',
      jp: 'エンジニア、医師、弁護士、研究者、教員',
    },
    baseSalary: { us: 97_960, tw: 1_028_000, jp: 6_830_000 },
    raiseRange: { us: [0.030, 0.050], tw: [0.025, 0.045], jp: [0.025, 0.040] },
    ageRaiseFactor: { youngBoost: 1.3, midFactor: 1.0, seniorFactor: 0.6 },
    eventIds: [],
  },
  {
    id: 3,
    name: { us: 'Clerical/Admin', tw: '事務工作人員', jp: '事務従事者' },
    emoji: '📋',
    description: {
      us: 'Office Clerks, Secretaries, Data Entry, Admin Assistants',
      tw: '行政人員、文書處理、會計助理、櫃台人員',
      jp: '一般事務、経理事務、受付、秘書',
    },
    baseSalary: { us: 45_760, tw: 636_000, jp: 4_720_000 },
    raiseRange: { us: [0.020, 0.035], tw: [0.015, 0.030], jp: [0.015, 0.030] },
    ageRaiseFactor: { youngBoost: 1.1, midFactor: 1.0, seniorFactor: 0.8 },
    eventIds: [],
  },
  {
    id: 4,
    name: { us: 'Sales/Services', tw: '服務及銷售人員', jp: 'サービス職業従事者' },
    emoji: '🛒',
    description: {
      us: 'Retail Sales, Real Estate Agents, Insurance, Customer Service',
      tw: '門市銷售、房仲、保險業務、餐飲服務',
      jp: '販売員、飲食店員、介護職員、美容師',
    },
    baseSalary: { us: 36_470, tw: 552_000, jp: 3_840_000 },
    raiseRange: { us: [0.015, 0.035], tw: [0.010, 0.030], jp: [0.010, 0.025] },
    ageRaiseFactor: { youngBoost: 1.1, midFactor: 1.0, seniorFactor: 0.8 },
    eventIds: [],
  },
  {
    id: 5,
    name: { us: 'Skilled Trades', tw: '技術員及助理專業人員', jp: '生産工程・技能職' },
    emoji: '🔧',
    description: {
      us: 'Electricians, Plumbers, Mechanics, Technicians',
      tw: '技術員、維修人員、品管人員、電機技師',
      jp: '製造技術者、整備士、電気工事士、品質管理',
    },
    baseSalary: { us: 60_920, tw: 756_000, jp: 5_280_000 },
    raiseRange: { us: [0.020, 0.040], tw: [0.020, 0.035], jp: [0.020, 0.035] },
    ageRaiseFactor: { youngBoost: 1.2, midFactor: 1.0, seniorFactor: 0.7 },
    eventIds: [],
  },
  {
    id: 6,
    name: { us: 'Agriculture/Forestry', tw: '農林漁牧業工作人員', jp: '保安職業従事者' },
    emoji: '🌾',
    description: {
      us: 'Farmers, Ranchers, Fishers, Foresters, Agricultural Workers',
      tw: '農民、漁民、畜牧工作者、林業工作者',
      jp: '警察官、消防士、自衛官、警備員',
    },
    baseSalary: { us: 33_460, tw: 468_000, jp: 5_540_000 },
    raiseRange: { us: [0.010, 0.025], tw: [0.005, 0.020], jp: [0.020, 0.035] },
    ageRaiseFactor: { youngBoost: 1.0, midFactor: 1.0, seniorFactor: 0.9 },
    eventIds: [],
  },
  {
    id: 7,
    name: { us: 'Construction/Extraction', tw: '機械設備操作及組裝人員', jp: '輸送・機械運転従事者' },
    emoji: '🏗️',
    description: {
      us: 'Construction Workers, Miners, Carpenters, Roofers',
      tw: '機台操作員、組裝技工、CNC 操作、半導體設備員',
      jp: 'トラック運転手、電車運転士、クレーン運転士',
    },
    baseSalary: { us: 53_100, tw: 636_000, jp: 4_620_000 },
    raiseRange: { us: [0.020, 0.035], tw: [0.015, 0.030], jp: [0.015, 0.030] },
    ageRaiseFactor: { youngBoost: 1.1, midFactor: 1.0, seniorFactor: 0.7 },
    eventIds: [],
  },
  {
    id: 8,
    name: { us: 'Production/Manufacturing', tw: '基層技術工及勞力工', jp: '建設・採掘従事者' },
    emoji: '🏭',
    description: {
      us: 'Assembly Line, Machine Operators, Quality Control, Welders',
      tw: '搬運工、清潔工、營建工、體力勞動者',
      jp: '大工、とび職、土木作業員、配管工',
    },
    baseSalary: { us: 40_040, tw: 480_000, jp: 4_480_000 },
    raiseRange: { us: [0.015, 0.030], tw: [0.010, 0.025], jp: [0.015, 0.030] },
    ageRaiseFactor: { youngBoost: 1.0, midFactor: 1.0, seniorFactor: 0.7 },
    eventIds: [],
  },
  {
    id: 9,
    name: { us: 'IT/Digital', tw: '資訊科技人員', jp: '情報通信技術者' },
    emoji: '💻',
    description: {
      us: 'Software Developers, Data Scientists, Cybersecurity, DevOps',
      tw: '軟體工程師、資料分析師、網路管理師、UI/UX 設計',
      jp: 'ITエンジニア、データサイエンティスト、SE、プログラマー',
    },
    baseSalary: { us: 112_620, tw: 960_000, jp: 6_340_000 },
    raiseRange: { us: [0.035, 0.060], tw: [0.030, 0.055], jp: [0.030, 0.050] },
    ageRaiseFactor: { youngBoost: 1.3, midFactor: 1.0, seniorFactor: 0.5 },
    eventIds: [],
  },
  {
    id: 10,
    name: { us: 'Transportation/Logistics', tw: '軍人', jp: '運搬・清掃・包装等従事者' },
    emoji: '🚛',
    description: {
      us: 'Truck Drivers, Pilots, Logistics Coordinators, Warehouse Workers',
      tw: '志願役軍官、士官、士兵',
      jp: '運搬作業員、清掃員、包装作業員、廃棄物処理',
    },
    baseSalary: { us: 48_060, tw: 720_000, jp: 3_600_000 },
    raiseRange: { us: [0.015, 0.030], tw: [0.020, 0.035], jp: [0.010, 0.020] },
    ageRaiseFactor: { youngBoost: 1.0, midFactor: 1.0, seniorFactor: 0.8 },
    eventIds: [],
  },
]

/** 以 ID 快速查找職業 */
export const OCCUPATION_MAP = new Map(OCCUPATIONS.map(o => [o.id, o]))
