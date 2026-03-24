/**
 * 自住房模擬引擎
 *
 * 每年處理：
 * 1. 檢查是否達到購屋年齡 → 執行購屋（扣頭期款+交易成本）
 * 2. 計算年度房貸本息 + 持有成本
 * 3. 房價隨機漲跌
 * 4. 房貸餘額遞減
 * 5. 回傳該年對 portfolio / contribution 的影響
 */

import type { Region } from '../config/regions'
import type { HousingPlan, HousingState, YearHousingSnapshot } from './housingTypes'
import { INITIAL_HOUSING_STATE } from './housingTypes'
import { HOUSING_PARAMS } from './housingData'

/** 計算等額本息每年償還額 (PMT 公式) */
function calcAnnualMortgagePayment(principal: number, annualRate: number, years: number): number {
  if (annualRate <= 0) {
    // 零利率：純本金均攤
    return principal / years
  }
  const r = annualRate
  return principal * (r * Math.pow(1 + r, years)) / (Math.pow(1 + r, years) - 1)
}

export interface HousingYearResult {
  newState: HousingState
  /** 購屋當年從 portfolio 扣除的一次性成本（頭期款+交易成本） */
  upfrontCost: number
  /** 該年房貸+持有成本總額（影響 contribution） */
  annualHousingExpense: number
  /** 省下的租金（自住所以不用付租金，可視為隱性收益） */
  rentSaved: number
  snapshot: YearHousingSnapshot
}

export function processHousingYear(
  state: HousingState,
  plan: HousingPlan,
  age: number,
  annualIncome: number,
  portfolio: number,
  activeRegion: Region,
  /** 標準常態隨機數 (用於房價漲跌) */
  normalRandom: number,
): HousingYearResult {
  const params = HOUSING_PARAMS[activeRegion]
  let newState = { ...state }
  let upfrontCost = 0
  let annualHousingExpense = 0
  let rentSaved = 0

  // === 購屋觸發 ===
  if (newState.phase === 'none' && age >= plan.purchaseAge) {
    const targetPrice = annualIncome * plan.priceToIncomeRatio
    const downPayment = targetPrice * plan.downPaymentRatio
    const closingCost = targetPrice * params.closingCostRatio
    const totalUpfront = downPayment + closingCost

    // 檢查 portfolio 是否足夠支付頭期款+交易成本
    if (portfolio >= totalUpfront) {
      const loanAmount = targetPrice - downPayment
      const annualPayment = calcAnnualMortgagePayment(
        loanAmount, params.mortgageRate, plan.mortgageYears,
      )

      newState = {
        phase: 'purchased',
        purchasePrice: targetPrice,
        currentValue: targetPrice,
        mortgageBalance: loanAmount,
        annualMortgagePayment: annualPayment,
        annualHoldingCost: targetPrice * params.annualHoldingCostRatio,
        downPaymentPaid: downPayment,
        mortgageRate: params.mortgageRate,
        remainingYears: plan.mortgageYears,
        purchaseAge: age,
      }

      upfrontCost = totalUpfront
    }
    // 如果不夠，延後（下一年再試）
  }

  // === 已購屋的年度處理 ===
  if (newState.phase === 'purchased') {
    // 房價隨機漲跌
    const appreciation = params.appreciationMean + params.appreciationStd * normalRandom
    newState.currentValue *= (1 + appreciation)
    if (newState.currentValue < 0) newState.currentValue = 0

    // 持有成本隨房價更新
    newState.annualHoldingCost = newState.currentValue * params.annualHoldingCostRatio

    // 年度總住房支出 = 房貸 + 持有成本
    annualHousingExpense = newState.annualMortgagePayment + newState.annualHoldingCost

    // 房貸餘額遞減（年度利息 + 本金攤還）
    const interestThisYear = newState.mortgageBalance * newState.mortgageRate
    const principalThisYear = newState.annualMortgagePayment - interestThisYear
    newState.mortgageBalance = Math.max(0, newState.mortgageBalance - principalThisYear)
    newState.remainingYears -= 1

    // 房貸繳完
    if (newState.remainingYears <= 0 || newState.mortgageBalance <= 0) {
      newState.phase = 'paid_off'
      newState.mortgageBalance = 0
      newState.annualMortgagePayment = 0
      newState.remainingYears = 0
    }

    // 省下的租金
    rentSaved = newState.currentValue * params.rentToValueRatio
  }

  // === 已繳完房貸 ===
  if (newState.phase === 'paid_off') {
    // 房價仍然隨機漲跌
    if (state.phase === 'paid_off') {
      // 只有在 paid_off 進入此段（不是剛從 purchased 轉來）才更新房價
      const appreciation = params.appreciationMean + params.appreciationStd * normalRandom
      newState.currentValue *= (1 + appreciation)
    }
    newState.annualHoldingCost = newState.currentValue * params.annualHoldingCostRatio

    // 只有持有成本
    annualHousingExpense = newState.annualHoldingCost
    rentSaved = newState.currentValue * params.rentToValueRatio
  }

  const equity = newState.currentValue - newState.mortgageBalance

  return {
    newState,
    upfrontCost,
    annualHousingExpense,
    rentSaved,
    snapshot: {
      ownsHouse: newState.phase !== 'none',
      houseValue: newState.currentValue,
      mortgageBalance: newState.mortgageBalance,
      annualHousingCost: annualHousingExpense,
      equity: Math.max(0, equity),
    },
  }
}
