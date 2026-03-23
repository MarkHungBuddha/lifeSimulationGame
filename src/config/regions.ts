/**
 * 地區設定
 * 定義不同地區的幣值、資產標籤、滑桿範圍等
 */

import type { Allocation } from '../engine/simulator'

export type Region = 'us' | 'tw' | 'jp'

export interface RegionConfig {
  id: Region
  name: string
  flag: string
  currency: string
  currencySymbol: string
  assetLabels: Record<keyof Allocation, string>
  sliderRanges: {
    annualIncome: { min: number; max: number; step: number }
    annualExpense: { min: number; max: number; step: number }
    annualContribution: { min: number; max: number; step: number }
    initialPortfolio: { min: number; max: number; step: number }
    withdrawalAmount: { min: number; max: number; step: number }
    withdrawalFloor: { min: number; max: number; step: number }
    withdrawalCeiling: { min: number; max: number; step: number }
  }
}

export const REGION_CONFIGS: Record<Region, RegionConfig> = {
  us: {
    id: 'us',
    name: '美國版',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    assetLabels: {
      sp500: 'S&P 500',
      intlStock: '國際股票',
      bond: '美國長債',
      gold: '黃金',
      cash: '現金',
      reits: 'REITs',
    },
    sliderRanges: {
      annualIncome: { min: 20000, max: 500000, step: 5000 },
      annualExpense: { min: 10000, max: 300000, step: 5000 },
      annualContribution: { min: 0, max: 200000, step: 1000 },
      initialPortfolio: { min: 0, max: 2000000, step: 10000 },
      withdrawalAmount: { min: 10000, max: 300000, step: 5000 },
      withdrawalFloor: { min: 10000, max: 200000, step: 5000 },
      withdrawalCeiling: { min: 20000, max: 300000, step: 5000 },
    },
  },
  tw: {
    id: 'tw',
    name: '台灣版',
    flag: '🇹🇼',
    currency: 'TWD',
    currencySymbol: 'NT$',
    assetLabels: {
      sp500: '台股加權',
      intlStock: '海外股票',
      bond: '台灣公債',
      gold: '黃金',
      cash: '現金(TWD)',
      reits: '台灣REITs',
    },
    sliderRanges: {
      annualIncome: { min: 400000, max: 6000000, step: 50000 },
      annualExpense: { min: 200000, max: 4000000, step: 50000 },
      annualContribution: { min: 0, max: 3000000, step: 50000 },
      initialPortfolio: { min: 0, max: 50000000, step: 500000 },
      withdrawalAmount: { min: 200000, max: 5000000, step: 50000 },
      withdrawalFloor: { min: 200000, max: 3000000, step: 50000 },
      withdrawalCeiling: { min: 300000, max: 5000000, step: 50000 },
    },
  },
  jp: {
    id: 'jp',
    name: '日本版',
    flag: '🇯🇵',
    currency: 'JPY',
    currencySymbol: '¥',
    assetLabels: {
      sp500: '日本株',
      intlStock: '海外株式',
      bond: '日本国債',
      gold: '金(ゴールド)',
      cash: '現金(JPY)',
      reits: 'J-REIT',
    },
    sliderRanges: {
      annualIncome: { min: 2000000, max: 30000000, step: 500000 },
      annualExpense: { min: 1500000, max: 20000000, step: 500000 },
      annualContribution: { min: 0, max: 15000000, step: 500000 },
      initialPortfolio: { min: 0, max: 200000000, step: 1000000 },
      withdrawalAmount: { min: 1000000, max: 20000000, step: 500000 },
      withdrawalFloor: { min: 1000000, max: 15000000, step: 500000 },
      withdrawalCeiling: { min: 2000000, max: 25000000, step: 500000 },
    },
  },
}

/** 格式化金額（依地區） */
export function formatCurrency(n: number, region: Region): string {
  const cfg = REGION_CONFIGS[region]
  if (region === 'tw') {
    if (Math.abs(n) >= 100_000_000) return `${cfg.currencySymbol}${(n / 100_000_000).toFixed(1)}億`
    if (Math.abs(n) >= 10_000) return `${cfg.currencySymbol}${(n / 10_000).toFixed(0)}萬`
    return `${cfg.currencySymbol}${n.toFixed(0)}`
  }
  if (region === 'jp') {
    if (Math.abs(n) >= 100_000_000) return `¥${(n / 100_000_000).toFixed(1)}億`
    if (Math.abs(n) >= 10_000) return `¥${(n / 10_000).toFixed(0)}万`
    return `¥${n.toFixed(0)}`
  }
  // US
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

/** 格式化帶正負號的金額 */
export function formatCurrencySigned(n: number, region: Region): string {
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '-'
  const cfg = REGION_CONFIGS[region]
  if (region === 'tw') {
    if (abs >= 100_000_000) return `${sign}${cfg.currencySymbol}${(abs / 100_000_000).toFixed(1)}億`
    if (abs >= 10_000) return `${sign}${cfg.currencySymbol}${(abs / 10_000).toFixed(0)}萬`
    return `${sign}${cfg.currencySymbol}${abs.toFixed(0)}`
  }
  if (region === 'jp') {
    if (abs >= 100_000_000) return `${sign}¥${(abs / 100_000_000).toFixed(1)}億`
    if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(0)}万`
    return `${sign}¥${abs.toFixed(0)}`
  }
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

/** 格式化滑桿值 */
export function formatSliderValue(v: number, region: Region): string {
  const cfg = REGION_CONFIGS[region]
  if (region === 'tw') {
    if (v >= 100_000_000) return `${cfg.currencySymbol}${(v / 100_000_000).toFixed(1)}億`
    if (v >= 10_000) return `${cfg.currencySymbol}${(v / 10_000).toFixed(0)}萬`
    return `${cfg.currencySymbol}${v.toLocaleString()}`
  }
  if (region === 'jp') {
    if (v >= 100_000_000) return `¥${(v / 100_000_000).toFixed(1)}億`
    if (v >= 10_000) return `¥${(v / 10_000).toFixed(0)}万`
    return `¥${v.toLocaleString()}`
  }
  return `$${v.toLocaleString()}`
}
