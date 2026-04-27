/**
 * 三國購屋參數
 * 資料來源：monte_carlo_housing.md
 */

import type { Region } from '../config/regions'
import type { CountryHousingParams } from './housingTypes'

export const HOUSING_PARAMS: Record<Region, CountryHousingParams> = {
  'ph-manila': {
    mortgageRate: 0.074,
    closingCostRatio: 0.06,
    annualHoldingCostRatio: 0.015,
    appreciationMean: 0.05,
    appreciationStd: 0.09,
    rentToValueRatio: 0.055,
    defaultPriceToIncomeRatio: 9,
    priceToIncomeRange: { min: 5, max: 15, step: 1 },
    defaultDownPaymentRatio: 0.2,
    defaultMortgageYears: 20,
    mortgageYearsOptions: [10, 15, 20, 25, 30],
  },
  'ph-cebu': {
    mortgageRate: 0.070,
    closingCostRatio: 0.06,
    annualHoldingCostRatio: 0.013,
    appreciationMean: 0.025,
    appreciationStd: 0.08,
    rentToValueRatio: 0.05,
    defaultPriceToIncomeRatio: 7,
    priceToIncomeRange: { min: 4, max: 12, step: 1 },
    defaultDownPaymentRatio: 0.2,
    defaultMortgageYears: 20,
    mortgageYearsOptions: [10, 15, 20, 25, 30],
  },
  tw: {
    // 台灣：機動利率 2.2-2.8%，取中間值
    mortgageRate: 0.025,
    // 交易成本 3-5%
    closingCostRatio: 0.04,
    // 持有成本：房屋稅+地價稅 0.2-0.5% + 管理費約0.3% + 維修0.5%
    annualHoldingCostRatio: 0.01,
    // 台灣近10年房價年均+4%
    appreciationMean: 0.04,
    appreciationStd: 0.08,
    // 租金報酬率約 1.5-2.5%
    rentToValueRatio: 0.02,
    // 雙北房價所得比約 12
    defaultPriceToIncomeRatio: 12,
    priceToIncomeRange: { min: 5, max: 20, step: 1 },
    defaultDownPaymentRatio: 0.2,
    defaultMortgageYears: 30,
    mortgageYearsOptions: [20, 25, 30, 35, 40],
  },
  jp: {
    // 日本：變動利率 0.3-0.5%，固定Flat35 1.8-2.5%，取變動
    mortgageRate: 0.005,
    // 交易成本 6-10%
    closingCostRatio: 0.08,
    // 持有成本：固定資産税+都市計画税 1.4-1.7% + 管理費+修繕積立金約0.8%
    annualHoldingCostRatio: 0.022,
    // 東京近年 +2%，建物折舊
    appreciationMean: 0.02,
    appreciationStd: 0.06,
    // 日本租金報酬率約 3-5%
    rentToValueRatio: 0.035,
    // 東京房價所得比約 10-13
    defaultPriceToIncomeRatio: 10,
    priceToIncomeRange: { min: 5, max: 16, step: 1 },
    defaultDownPaymentRatio: 0.2,
    defaultMortgageYears: 35,
    mortgageYearsOptions: [20, 25, 30, 35],
  },
  us: {
    // 美國：30年固定 6.5-7.2%
    mortgageRate: 0.068,
    // 交易成本 2-5%
    closingCostRatio: 0.03,
    // 持有成本：Property Tax 1-2.5% + Insurance 0.3% + Maintenance 1-2%
    annualHoldingCostRatio: 0.025,
    // 美國全國 +3%
    appreciationMean: 0.03,
    appreciationStd: 0.07,
    // 租金報酬率約 4-6%
    rentToValueRatio: 0.05,
    // 全國5-8，灣區10-12
    defaultPriceToIncomeRatio: 8,
    priceToIncomeRange: { min: 3, max: 15, step: 1 },
    defaultDownPaymentRatio: 0.2,
    defaultMortgageYears: 30,
    mortgageYearsOptions: [15, 20, 30],
  },
}
