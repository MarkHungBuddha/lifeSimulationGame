/**
 * 移民狀態機引擎
 *
 * 每年模擬時呼叫，根據當前移民階段決定：
 * - 使用哪個國家的事件池
 * - 收入/支出調整
 * - 移民成本扣除
 * - 階段轉換
 */

import type { ImmigrationPlan, ImmigrationState, ImmigrationRoute, ImmigrationPhase } from './immigrationTypes'
import { INITIAL_IMMIGRATION_STATE } from './immigrationTypes'
import { getImmigrationRoute, getImmigrationEvents } from './immigrationData'
import type { Allocation } from './simulator'
import { LIFESTYLE_PRESETS } from './lifestyle'
import { LIFESTYLE_PRESETS_JP } from './lifestyle_jp'
import type { Region } from '../config/regions'
import type { TriggeredEvent, RandomEvent } from '../events/eventTypes'

/** 取得目標國的預設投資配置 */
function getTargetAllocation(target: Region): Allocation {
  if (target === 'jp') return { ...LIFESTYLE_PRESETS_JP.moderate.allocation }
  if (target === 'us') return { ...LIFESTYLE_PRESETS.moderate.allocation }
  return { ...LIFESTYLE_PRESETS.moderate.allocation }
}

export interface ImmigrationYearResult {
  newState: ImmigrationState
  activeRegion: Region
  costThisYear: number
  incomeMultiplier: number
  expenseMultiplier: number
  immigrationEvents: TriggeredEvent[]
  phaseChanged: boolean
  phaseLabel: string | null
  switchedAllocation: Allocation | null  // 移民後的投資組合配置
}

function createPhaseEvent(
  name: string,
  description: string,
  age: number,
  year: number,
  isPositive?: boolean,
): TriggeredEvent {
  return {
    event: {
      id: `imm_phase_${year}`,
      name,
      category: 'immigration',
      description,
      baseProbability: 1,
      durationMonths: [0, 0],
      impacts: [],
      isPositive,
    },
    age,
    year,
    actualImpacts: [],
  }
}

export function processImmigrationYear(
  prevState: ImmigrationState | undefined,
  plan: ImmigrationPlan | undefined,
  age: number,
  year: number,
  portfolio: number,
  annualIncome: number,
  rng: () => number,
): ImmigrationYearResult {
  const state: ImmigrationState = prevState
    ? { ...prevState }
    : { ...INITIAL_IMMIGRATION_STATE }

  const noChange: ImmigrationYearResult = {
    newState: state,
    activeRegion: plan?.originRegion ?? 'tw',
    costThisYear: 0,
    incomeMultiplier: 1,
    expenseMultiplier: 1,
    immigrationEvents: [],
    phaseChanged: false,
    phaseLabel: null,
    switchedAllocation: null,
  }

  if (!plan?.enabled) return noChange

  const route = getImmigrationRoute(plan.originRegion, plan.targetRegion)
  if (!route) return noChange

  const events: TriggeredEvent[] = []
  let cost = 0
  let incMult = 1
  let expMult = 1
  let activeRegion: Region = plan.originRegion
  let phaseChanged = false
  let phaseLabel: string | null = null
  const prevPhase = state.phase

  const setPhase = (p: ImmigrationPhase, label: string) => {
    state.phase = p
    state.phaseStartAge = age
    phaseChanged = true
    phaseLabel = label
  }

  // ── 狀態機 ──────────────────────────────────
  switch (state.phase) {
    case 'none': {
      if (age >= plan.triggerAge) {
        setPhase('preparing', '開始準備移民')
        cost = route.preparationCostPerYear
        events.push(createPhaseEvent(
          `開始準備移民 → ${plan.targetRegion === 'jp' ? '🇯🇵 日本' : '🇺🇸 美國'}`,
          `語言學習、求職準備。預計費用 ${route.preparationCostPerYear.toLocaleString()} 元`,
          age, year,
        ))
      }
      break
    }

    case 'preparing': {
      const yearsInPrep = age - state.phaseStartAge
      cost = route.preparationCostPerYear
      if (yearsInPrep >= route.preparationYears) {
        // 準備完成，進入簽證申請
        setPhase('visa_applying', '申請簽證中')
        events.push(createPhaseEvent(
          plan.targetRegion === 'jp' ? '提交 COE 申請' : '參加 H-1B 抽籤',
          plan.targetRegion === 'jp'
            ? '已取得 offer，申請在留資格認定證明書'
            : `H-1B 抽籤第 ${state.failedAttempts + 1} 次，中籤率約 ${(route.visaSuccessRate * 100).toFixed(0)}%`,
          age, year,
        ))
      }
      break
    }

    case 'visa_applying': {
      // 擲骰子：簽證成功 or 失敗
      if (rng() < route.visaSuccessRate) {
        // 成功！
        setPhase('transition', '簽證通過')
        cost = route.transitionCost
        events.push(createPhaseEvent(
          `簽證通過！移居 ${plan.targetRegion === 'jp' ? '🇯🇵 日本' : '🇺🇸 美國'}`,
          `支付過渡成本 ${route.transitionCost.toLocaleString()} 元。開始新生活！`,
          age, year, true,
        ))
      } else {
        state.failedAttempts++
        if (state.failedAttempts >= plan.maxAttempts) {
          setPhase('abandoned', '放棄移民')
          events.push(createPhaseEvent(
            '移民計畫放棄',
            `簽證申請 ${state.failedAttempts} 次失敗後放棄移民計畫`,
            age, year,
          ))
        } else {
          setPhase('visa_failed', '簽證未通過')
          events.push(createPhaseEvent(
            plan.targetRegion === 'us' ? 'H-1B 抽籤落選' : '簽證申請被拒',
            `第 ${state.failedAttempts} 次失敗。將於明年再次嘗試`,
            age, year,
          ))
        }
      }
      break
    }

    case 'visa_failed': {
      // 自動重試
      setPhase('visa_applying', '再次申請簽證')
      events.push(createPhaseEvent(
        plan.targetRegion === 'us' ? '再次參加 H-1B 抽籤' : '重新申請簽證',
        `第 ${state.failedAttempts + 1} 次嘗試`,
        age, year,
      ))
      break
    }

    case 'transition': {
      // 過渡期1年，使用目標國參數
      activeRegion = plan.targetRegion
      incMult = route.incomeMultiplier
      expMult = route.expenseMultiplier * route.settlementPremium
      state.yearsInTarget = 1
      setPhase('settled', '定居中')
      break
    }

    case 'settled': {
      activeRegion = plan.targetRegion
      state.yearsInTarget++
      incMult = route.incomeMultiplier
      expMult = route.expenseMultiplier
      if (state.yearsInTarget <= route.settlementPremiumYears) {
        expMult *= route.settlementPremium
      }

      // 被迫回國檢查（前3年較高）
      const returnRate = state.yearsInTarget <= 3 ? route.annualReturnRate : route.annualReturnRate * 0.5
      if (rng() < returnRate) {
        setPhase('forced_return', '被迫回國')
        cost = route.returnCost
        activeRegion = plan.originRegion
        incMult = route.returnIncomePenalty
        expMult = 1
        events.push(createPhaseEvent(
          '被迫回國',
          `簽證問題或個人因素，返回${plan.originRegion === 'tw' ? '台灣' : '原居國'}。重置成本 ${route.returnCost.toLocaleString()} 元`,
          age, year,
        ))
        break
      }

      // 永住申請檢查
      if (state.yearsInTarget >= route.prEligibleAfterYears && !state.hasPermanentResidency) {
        if (rng() < route.prSuccessRate) {
          state.hasPermanentResidency = true
          setPhase('permanent', '取得永住權')
          events.push(createPhaseEvent(
            `取得永住權！🎉`,
            plan.targetRegion === 'jp'
              ? '永住許可取得。簽證風險消除，職涯自由度大幅提升'
              : '綠卡批准。不再受雇主綁定，可自由轉換工作',
            age, year, true,
          ))
        } else {
          events.push(createPhaseEvent(
            '永住申請被拒',
            '需等待 1 年後再次申請',
            age, year,
          ))
        }
      }

      // 移民專屬隨機事件
      rollImmigrationEvents(route.target, age, year, portfolio, annualIncome, rng, events)
      break
    }

    case 'permanent': {
      activeRegion = plan.targetRegion
      state.yearsInTarget++
      incMult = route.incomeMultiplier
      expMult = route.expenseMultiplier
      // 永住後仍有移民事件（匯率、文化等）但無簽證風險
      rollImmigrationEvents(route.target, age, year, portfolio, annualIncome, rng, events)
      break
    }

    case 'forced_return': {
      // 轉為 returned，回到原居國
      setPhase('returned', '已回國')
      incMult = route.returnIncomePenalty
      events.push(createPhaseEvent(
        '重新適應原居國生活',
        '海歸重新找工作中，收入暫時降低',
        age, year,
      ))
      break
    }

    case 'returned':
    case 'abandoned': {
      // 回到原居國，不再有移民相關影響
      // returned 的第一年有收入懲罰
      if (prevPhase === 'forced_return' || (state.phaseStartAge === age)) {
        incMult = route.returnIncomePenalty
      }
      break
    }
  }

  state.totalImmigrationCost += cost

  // 移民到目標國後，投資組合切換為目標國預設配置
  const inTargetCountry = ['transition', 'settled', 'permanent'].includes(state.phase)
  const switchedAllocation = inTargetCountry ? getTargetAllocation(plan.targetRegion) : null

  return {
    newState: state,
    activeRegion,
    costThisYear: cost,
    incomeMultiplier: incMult,
    expenseMultiplier: expMult,
    immigrationEvents: events,
    phaseChanged,
    phaseLabel,
    switchedAllocation,
  }
}

/** 擲骰移民專屬隨機事件 */
function rollImmigrationEvents(
  target: string,
  age: number,
  year: number,
  portfolio: number,
  annualIncome: number,
  rng: () => number,
  events: TriggeredEvent[],
) {
  const immEvents = getImmigrationEvents(target)
  for (const evt of immEvents) {
    let prob = evt.baseProbability
    if (evt.ageProbabilities) {
      for (const ap of evt.ageProbabilities) {
        if (age >= ap.minAge && age <= ap.maxAge) {
          prob = ap.probability
          break
        }
      }
    }
    if (rng() < prob) {
      const actualImpacts: TriggeredEvent['actualImpacts'] = []
      const monthlyIncome = annualIncome / 12

      for (const impact of evt.impacts) {
        let amount = 0
        let description = ''
        switch (impact.type) {
          case 'income_change':
            amount = annualIncome * impact.value
            description = `收入 ${impact.value > 0 ? '+' : ''}${(impact.value * 100).toFixed(0)}%`
            break
          case 'savings_change':
          case 'portfolio_change':
            amount = portfolio * impact.value
            description = `投資組合 ${impact.value > 0 ? '+' : ''}${(impact.value * 100).toFixed(0)}%`
            break
          case 'extra_expense':
            amount = -(monthlyIncome * impact.value)
            description = `額外支出 ${impact.value.toFixed(1)}x 月收入`
            break
          case 'income_boost':
            amount = annualIncome * impact.value
            description = `收入永久 ${impact.value > 0 ? '+' : ''}${(impact.value * 100).toFixed(0)}%`
            break
          case 'savings_boost':
            amount = portfolio * impact.value
            description = `儲蓄 ${impact.value > 0 ? '+' : ''}${(impact.value * 100).toFixed(0)}%`
            break
        }
        actualImpacts.push({ type: impact.type, description, amount })
      }

      events.push({ event: evt, age, year, actualImpacts })
    }
  }
}
