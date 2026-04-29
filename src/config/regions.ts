import type { UiLanguage } from '../i18n/types'
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

const REGION_NAME_MAP: Record<UiLanguage, Record<Region, string>> = {
  en: {
    us: 'United States',
    tw: 'Taiwan',
    jp: 'Japan',
    'ph-manila': 'Manila',
    'ph-cebu': 'Cebu',
  },
  'zh-Hant': {
    us: '美國',
    tw: '台灣',
    jp: '日本',
    'ph-manila': '馬尼拉',
    'ph-cebu': '宿霧',
  },
  ja: {
    us: 'アメリカ',
    tw: '台湾',
    jp: '日本',
    'ph-manila': 'マニラ',
    'ph-cebu': 'セブ',
  },
}

const REGION_FLAG_MAP: Record<Region, string> = {
  us: 'US',
  tw: 'TW',
  jp: 'JP',
  'ph-manila': 'PH',
  'ph-cebu': 'PH',
}

const ASSET_LABEL_MAP: Record<UiLanguage, Record<Region, Record<keyof Allocation, string>>> = {
  en: {
    us: REGION_CONFIGS.us.assetLabels,
    tw: REGION_CONFIGS.tw.assetLabels,
    jp: REGION_CONFIGS.jp.assetLabels,
    'ph-manila': REGION_CONFIGS['ph-manila'].assetLabels,
    'ph-cebu': REGION_CONFIGS['ph-cebu'].assetLabels,
  },
  'zh-Hant': {
    us: {
      sp500: 'S&P 500',
      intlStock: '國際股票',
      bond: '美國債券',
      gold: '黃金',
      cash: '現金',
      reits: 'REITs',
    },
    tw: {
      sp500: '美股',
      intlStock: '國際股票',
      bond: '台灣債券',
      gold: '黃金',
      cash: '現金（TWD）',
      reits: '台灣 REITs',
    },
    jp: {
      sp500: '美股',
      intlStock: '國際股票',
      bond: '日本債券',
      gold: '黃金',
      cash: '現金（JPY）',
      reits: 'J-REIT',
    },
    'ph-manila': {
      sp500: '美股 / PSEi 代理',
      intlStock: '國際股票',
      bond: '債券',
      gold: '黃金',
      cash: '現金（PHP）',
      reits: '菲律賓 REITs',
    },
    'ph-cebu': {
      sp500: '美股 / PSEi 代理',
      intlStock: '國際股票',
      bond: '債券',
      gold: '黃金',
      cash: '現金（PHP）',
      reits: '菲律賓 REITs',
    },
  },
  ja: {
    us: {
      sp500: 'S&P 500',
      intlStock: '海外株式',
      bond: '米国債券',
      gold: '金',
      cash: '現金',
      reits: 'REITs',
    },
    tw: {
      sp500: '米国株',
      intlStock: '海外株式',
      bond: '台湾債券',
      gold: '金',
      cash: '現金（TWD）',
      reits: '台湾 REITs',
    },
    jp: {
      sp500: '米国株',
      intlStock: '海外株式',
      bond: '日本債券',
      gold: '金',
      cash: '現金（JPY）',
      reits: 'J-REIT',
    },
    'ph-manila': {
      sp500: '米国株 / PSEi 連動',
      intlStock: '海外株式',
      bond: '債券',
      gold: '金',
      cash: '現金（PHP）',
      reits: 'フィリピン REITs',
    },
    'ph-cebu': {
      sp500: '米国株 / PSEi 連動',
      intlStock: '海外株式',
      bond: '債券',
      gold: '金',
      cash: '現金（PHP）',
      reits: 'フィリピン REITs',
    },
  },
}

const NUMBER_LOCALE_MAP: Record<UiLanguage, string> = {
  en: 'en-US',
  'zh-Hant': 'zh-TW',
  ja: 'ja-JP',
}

function getCompactUnit(language: UiLanguage, large: 'tenThousand' | 'hundredMillion'): string {
  if (language === 'zh-Hant') return large === 'hundredMillion' ? '億' : '萬'
  if (language === 'ja') return large === 'hundredMillion' ? '億' : '万'
  return large === 'hundredMillion' ? 'B' : 'K'
}

export function isPhilippinesRegion(region: Region): boolean {
  return region === 'ph-manila' || region === 'ph-cebu'
}

export function getNumberLocale(language: UiLanguage): string {
  return NUMBER_LOCALE_MAP[language]
}

export function getRegionLabel(region: Region, language: UiLanguage): string {
  return REGION_NAME_MAP[language][region]
}

export function getRegionFlag(region: Region): string {
  return REGION_FLAG_MAP[region]
}

export function getAssetLabel(region: Region, key: keyof Allocation, language: UiLanguage): string {
  return ASSET_LABEL_MAP[language][region][key]
}

export function formatCurrency(n: number, region: Region, language: UiLanguage = 'en'): string {
  const cfg = REGION_CONFIGS[region]
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  const locale = getNumberLocale(language)

  if (region === 'tw' || region === 'jp') {
    if (abs >= 100_000_000) {
      return `${sign}${cfg.currencySymbol}${(abs / 100_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}${getCompactUnit(language, 'hundredMillion')}`
    }
    if (abs >= 10_000) {
      return `${sign}${cfg.currencySymbol}${(abs / 10_000).toLocaleString(locale, { maximumFractionDigits: 0 })}${getCompactUnit(language, 'tenThousand')}`
    }
    return `${sign}${cfg.currencySymbol}${abs.toLocaleString(locale, { maximumFractionDigits: 0 })}`
  }

  if (isPhilippinesRegion(region)) {
    if (abs >= 1_000_000) {
      return `${sign}${cfg.currencySymbol}${(abs / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
    }
    if (abs >= 1_000) {
      return `${sign}${cfg.currencySymbol}${(abs / 1_000).toLocaleString(locale, { maximumFractionDigits: 0 })}K`
    }
    return `${sign}${cfg.currencySymbol}${abs.toLocaleString(locale, { maximumFractionDigits: 0 })}`
  }

  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toLocaleString(locale, { maximumFractionDigits: 0 })}K`
  return `${sign}$${abs.toLocaleString(locale, { maximumFractionDigits: 0 })}`
}

export function formatCurrencySigned(n: number, region: Region, language: UiLanguage = 'en'): string {
  if (n === 0) return formatCurrency(0, region, language)
  return n > 0
    ? `+${formatCurrency(n, region, language)}`
    : `-${formatCurrency(Math.abs(n), region, language)}`
}

export function formatSliderValue(v: number, region: Region, language: UiLanguage = 'en'): string {
  return formatCurrency(v, region, language)
}
