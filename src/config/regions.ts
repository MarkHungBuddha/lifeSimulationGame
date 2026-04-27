import type { Allocation } from '../engine/simulator'

export type Region = 'us' | 'tw' | 'jp' | 'ph-manila' | 'ph-cebu'

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
    name: 'United States',
    flag: 'US',
    currency: 'USD',
    currencySymbol: '$',
    assetLabels: {
      sp500: 'S&P 500',
      intlStock: 'International Stocks',
      bond: 'US Bonds',
      gold: 'Gold',
      cash: 'Cash',
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
    name: 'Taiwan',
    flag: 'TW',
    currency: 'TWD',
    currencySymbol: 'NT$',
    assetLabels: {
      sp500: 'US Stocks',
      intlStock: 'International Stocks',
      bond: 'Taiwan Bonds',
      gold: 'Gold',
      cash: 'Cash (TWD)',
      reits: 'Taiwan REITs',
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
    name: 'Japan',
    flag: 'JP',
    currency: 'JPY',
    currencySymbol: 'JPY ',
    assetLabels: {
      sp500: 'US Stocks',
      intlStock: 'International Stocks',
      bond: 'Japan Bonds',
      gold: 'Gold',
      cash: 'Cash (JPY)',
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
  'ph-manila': {
    id: 'ph-manila',
    name: 'Manila',
    flag: 'PH',
    currency: 'PHP',
    currencySymbol: 'PHP ',
    assetLabels: {
      sp500: 'US Stocks / PSEi Proxy',
      intlStock: 'International Stocks',
      bond: 'Bonds',
      gold: 'Gold',
      cash: 'Cash (PHP)',
      reits: 'Philippine REITs',
    },
    sliderRanges: {
      annualIncome: { min: 180000, max: 4000000, step: 20000 },
      annualExpense: { min: 120000, max: 2500000, step: 20000 },
      annualContribution: { min: 0, max: 2000000, step: 20000 },
      initialPortfolio: { min: 0, max: 80000000, step: 500000 },
      withdrawalAmount: { min: 120000, max: 2500000, step: 20000 },
      withdrawalFloor: { min: 100000, max: 1800000, step: 20000 },
      withdrawalCeiling: { min: 180000, max: 3500000, step: 20000 },
    },
  },
  'ph-cebu': {
    id: 'ph-cebu',
    name: 'Cebu',
    flag: 'PH',
    currency: 'PHP',
    currencySymbol: 'PHP ',
    assetLabels: {
      sp500: 'US Stocks / PSEi Proxy',
      intlStock: 'International Stocks',
      bond: 'Bonds',
      gold: 'Gold',
      cash: 'Cash (PHP)',
      reits: 'Philippine REITs',
    },
    sliderRanges: {
      annualIncome: { min: 150000, max: 3000000, step: 20000 },
      annualExpense: { min: 100000, max: 2000000, step: 20000 },
      annualContribution: { min: 0, max: 1500000, step: 20000 },
      initialPortfolio: { min: 0, max: 60000000, step: 500000 },
      withdrawalAmount: { min: 100000, max: 2000000, step: 20000 },
      withdrawalFloor: { min: 80000, max: 1400000, step: 20000 },
      withdrawalCeiling: { min: 150000, max: 2800000, step: 20000 },
    },
  },
}

export function isPhilippinesRegion(region: Region): boolean {
  return region === 'ph-manila' || region === 'ph-cebu'
}

export function formatCurrency(n: number, region: Region): string {
  const cfg = REGION_CONFIGS[region]

  if (region === 'tw') {
    if (Math.abs(n) >= 100_000_000) return `${cfg.currencySymbol}${(n / 100_000_000).toFixed(1)}Yi`
    if (Math.abs(n) >= 10_000) return `${cfg.currencySymbol}${(n / 10_000).toFixed(0)}Wan`
    return `${cfg.currencySymbol}${n.toFixed(0)}`
  }

  if (region === 'jp') {
    if (Math.abs(n) >= 100_000_000) return `${cfg.currencySymbol}${(n / 100_000_000).toFixed(1)}Oku`
    if (Math.abs(n) >= 10_000) return `${cfg.currencySymbol}${(n / 10_000).toFixed(0)}Man`
    return `${cfg.currencySymbol}${n.toFixed(0)}`
  }

  if (isPhilippinesRegion(region)) {
    if (Math.abs(n) >= 1_000_000) return `${cfg.currencySymbol}${(n / 1_000_000).toFixed(2)}M`
    if (Math.abs(n) >= 1_000) return `${cfg.currencySymbol}${(n / 1_000).toFixed(0)}K`
    return `${cfg.currencySymbol}${n.toFixed(0)}`
  }

  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function formatCurrencySigned(n: number, region: Region): string {
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '-'
  const cfg = REGION_CONFIGS[region]

  if (region === 'tw') {
    if (abs >= 100_000_000) return `${sign}${cfg.currencySymbol}${(abs / 100_000_000).toFixed(1)}Yi`
    if (abs >= 10_000) return `${sign}${cfg.currencySymbol}${(abs / 10_000).toFixed(0)}Wan`
    return `${sign}${cfg.currencySymbol}${abs.toFixed(0)}`
  }

  if (region === 'jp') {
    if (abs >= 100_000_000) return `${sign}${cfg.currencySymbol}${(abs / 100_000_000).toFixed(1)}Oku`
    if (abs >= 10_000) return `${sign}${cfg.currencySymbol}${(abs / 10_000).toFixed(0)}Man`
    return `${sign}${cfg.currencySymbol}${abs.toFixed(0)}`
  }

  if (isPhilippinesRegion(region)) {
    if (abs >= 1_000_000) return `${sign}${cfg.currencySymbol}${(abs / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${sign}${cfg.currencySymbol}${(abs / 1_000).toFixed(0)}K`
    return `${sign}${cfg.currencySymbol}${abs.toFixed(0)}`
  }

  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function formatSliderValue(v: number, region: Region): string {
  const cfg = REGION_CONFIGS[region]

  if (region === 'tw') {
    if (v >= 100_000_000) return `${cfg.currencySymbol}${(v / 100_000_000).toFixed(1)}Yi`
    if (v >= 10_000) return `${cfg.currencySymbol}${(v / 10_000).toFixed(0)}Wan`
    return `${cfg.currencySymbol}${v.toLocaleString()}`
  }

  if (region === 'jp') {
    if (v >= 100_000_000) return `${cfg.currencySymbol}${(v / 100_000_000).toFixed(1)}Oku`
    if (v >= 10_000) return `${cfg.currencySymbol}${(v / 10_000).toFixed(0)}Man`
    return `${cfg.currencySymbol}${v.toLocaleString()}`
  }

  if (isPhilippinesRegion(region)) {
    return `${cfg.currencySymbol}${v.toLocaleString()}`
  }

  return `$${v.toLocaleString()}`
}
