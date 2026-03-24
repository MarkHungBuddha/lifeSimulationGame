/**
 * 自住房購買模組 — 型別定義
 *
 * 支援台灣、日本、美國三國購屋模擬
 */

import type { Region } from '../config/regions'

/** 購屋計畫（使用者設定） */
export interface HousingPlan {
  enabled: boolean
  /** 預計購屋年齡 */
  purchaseAge: number
  /** 房價所得比（用年收入 × 此值算出目標房價） */
  priceToIncomeRatio: number
  /** 頭期款比例 0-1 */
  downPaymentRatio: number
  /** 房貸年限 */
  mortgageYears: number
}

/** 購屋狀態（模擬中追蹤） */
export interface HousingState {
  phase: 'none' | 'purchased' | 'paid_off'
  /** 購買時的房價 */
  purchasePrice: number
  /** 當前房屋市值 */
  currentValue: number
  /** 房貸餘額 */
  mortgageBalance: number
  /** 每年房貸本息 */
  annualMortgagePayment: number
  /** 每年持有成本（稅金+管理費+維修） */
  annualHoldingCost: number
  /** 已付頭期款 */
  downPaymentPaid: number
  /** 房貸利率 */
  mortgageRate: number
  /** 剩餘房貸年數 */
  remainingYears: number
  /** 購屋年齡 */
  purchaseAge: number | null
}

/** 年度購屋快照（加入 YearSnapshot） */
export interface YearHousingSnapshot {
  ownsHouse: boolean
  houseValue: number
  mortgageBalance: number
  annualHousingCost: number
  equity: number
}

/** 各國購屋參數 */
export interface CountryHousingParams {
  /** 房貸利率 (年化) */
  mortgageRate: number
  /** 交易成本佔房價比例 */
  closingCostRatio: number
  /** 年持有成本佔房價比例（稅+管理+維修） */
  annualHoldingCostRatio: number
  /** 房價年變動率 均值 */
  appreciationMean: number
  /** 房價年變動率 標準差 */
  appreciationStd: number
  /** 租金佔房價年比例（用來計算省下的租金） */
  rentToValueRatio: number
  /** 房價所得比預設值 */
  defaultPriceToIncomeRatio: number
  /** 房價所得比範圍 */
  priceToIncomeRange: { min: number; max: number; step: number }
  /** 頭期款預設比例 */
  defaultDownPaymentRatio: number
  /** 房貸年限預設 */
  defaultMortgageYears: number
  /** 房貸年限選項 */
  mortgageYearsOptions: number[]
}

export const INITIAL_HOUSING_STATE: HousingState = {
  phase: 'none',
  purchasePrice: 0,
  currentValue: 0,
  mortgageBalance: 0,
  annualMortgagePayment: 0,
  annualHoldingCost: 0,
  downPaymentPaid: 0,
  mortgageRate: 0,
  remainingYears: 0,
  purchaseAge: null,
}
