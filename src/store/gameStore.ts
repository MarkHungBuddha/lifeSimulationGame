import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Allocation, WithdrawalStrategy, PathResult } from '../engine/simulator'
import { simulatePath } from '../engine/simulator'
import type { WorkerDoneMsg, WorkerRequest } from '../engine/worker'
import { LIFESTYLE_PRESETS, type LifestyleId } from '../engine/lifestyle'
import { LIFESTYLE_PRESETS_TW } from '../engine/lifestyle_tw'
import { LIFESTYLE_PRESETS_JP } from '../engine/lifestyle_jp'
import { getPhilippinesLifestylePresets } from '../engine/lifestyle_ph'
import { isPhilippinesRegion, type Region } from '../config/regions'
import type { ImmigrationPlan } from '../engine/immigrationTypes'
import type { HousingPlan } from '../engine/housingTypes'
import { HOUSING_PARAMS } from '../engine/housingData'
import type { OccupationPlan } from '../engine/occupationTypes'
import { getOccupationDefaults } from '../engine/occupationEngine'
import historicalData from '../../data/assets_returns.json'
import type { HistoricalData } from '../engine/bootstrap'

function getLifestylePresets(region: Region) {
  if (region === 'tw') return LIFESTYLE_PRESETS_TW
  if (region === 'jp') return LIFESTYLE_PRESETS_JP
  if (isPhilippinesRegion(region)) return getPhilippinesLifestylePresets(region)
  return LIFESTYLE_PRESETS
}

interface SimResult {
  successRate: number
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] }
  medianFinalPortfolio: number
  medianDepletionAge: number | null
  maxDrawdown: { median: number; p75: number; p90: number; worst: number }
  numPaths: number
  masterSeed: number
  eventsEnabled: boolean
}

type ViewMode = 'simulation' | 'story'

interface GameState {
  // 地區
  region: Region

  // 生活風格
  lifestyleId: LifestyleId
  annualIncome: number
  annualExpense: number

  // 參數
  currentAge: number
  retirementAge: number
  endAge: number
  initialPortfolio: number
  annualContribution: number
  allocation: Allocation
  withdrawal: WithdrawalStrategy
  numPaths: number
  enableEvents: boolean

  // 移民
  immigrationEnabled: boolean
  immigrationTarget: Region | null
  immigrationAge: number
  immigrationAllocation: Allocation

  // 職業
  occupationEnabled: boolean
  occupationId: number

  // 購屋
  housingEnabled: boolean
  housingPurchaseAge: number
  housingPriceToIncomeRatio: number
  housingDownPaymentRatio: number
  housingMortgageYears: number

  // 頁面
  viewMode: ViewMode

  // 批次模擬狀態
  isRunning: boolean
  progress: number
  result: SimResult | null

  // 人生故事模式
  storyResult: PathResult | null
  isStoryRunning: boolean

  // Actions
  setRegion: (r: Region) => void
  applyLifestyle: (id: Exclude<LifestyleId, 'custom'>) => void
  setAnnualIncome: (v: number) => void
  setAnnualExpense: (v: number) => void
  setCurrentAge: (v: number) => void
  setRetirementAge: (v: number) => void
  setEndAge: (v: number) => void
  setInitialPortfolio: (v: number) => void
  setAnnualContribution: (v: number) => void
  setAllocation: (a: Allocation) => void
  setWithdrawal: (w: WithdrawalStrategy) => void
  setNumPaths: (n: number) => void
  setEnableEvents: (v: boolean) => void
  setImmigrationEnabled: (v: boolean) => void
  setImmigrationTarget: (r: Region | null) => void
  setImmigrationAge: (v: number) => void
  setImmigrationAllocation: (a: Allocation) => void
  setOccupationEnabled: (v: boolean) => void
  setOccupationId: (id: number) => void
  setHousingEnabled: (v: boolean) => void
  setHousingPurchaseAge: (v: number) => void
  setHousingPriceToIncomeRatio: (v: number) => void
  setHousingDownPaymentRatio: (v: number) => void
  setHousingMortgageYears: (v: number) => void
  setViewMode: (m: ViewMode) => void
  runSimulation: () => void
  runStory: () => void
}

let worker: Worker | null = null

const defaultPreset = LIFESTYLE_PRESETS.moderate
const defaultHousingParams = HOUSING_PARAMS.us

export const useGameStore = create<GameState>()(persist((set, get) => ({
  region: 'us',
  lifestyleId: 'moderate',
  annualIncome: defaultPreset.annualIncome,
  annualExpense: defaultPreset.annualExpense,

  currentAge: 30,
  retirementAge: defaultPreset.retirementAge,
  endAge: 95,
  initialPortfolio: defaultPreset.initialPortfolio,
  annualContribution: defaultPreset.annualContribution,
  allocation: { ...defaultPreset.allocation },
  withdrawal: defaultPreset.withdrawal,
  numPaths: 10000,
  enableEvents: false,

  immigrationEnabled: false,
  immigrationTarget: null,
  immigrationAge: 30,
  immigrationAllocation: { ...LIFESTYLE_PRESETS_JP.moderate.allocation },

  occupationEnabled: false,
  occupationId: 2,  // 預設：專業人員

  housingEnabled: false,
  housingPurchaseAge: 35,
  housingPriceToIncomeRatio: defaultHousingParams.defaultPriceToIncomeRatio,
  housingDownPaymentRatio: defaultHousingParams.defaultDownPaymentRatio,
  housingMortgageYears: defaultHousingParams.defaultMortgageYears,

  viewMode: 'simulation',

  isRunning: false,
  progress: 0,
  result: null,

  storyResult: null,
  isStoryRunning: false,

  setRegion: (r) => {
    const presets = getLifestylePresets(r)
    const preset = presets.moderate
    const hp = HOUSING_PARAMS[r]
    const occEnabled = !isPhilippinesRegion(r) && get().occupationEnabled
    const occDefaults = occEnabled ? getOccupationDefaults(get().occupationId, r) : null
    set({
      region: r,
      lifestyleId: occEnabled ? 'custom' : 'moderate',
      annualIncome: occDefaults ? occDefaults.annualIncome : preset.annualIncome,
      annualExpense: preset.annualExpense,
      retirementAge: preset.retirementAge,
      initialPortfolio: preset.initialPortfolio,
      annualContribution: occDefaults ? occDefaults.annualContribution : preset.annualContribution,
      allocation: { ...preset.allocation },
      withdrawal: preset.withdrawal,
      result: null,
      storyResult: null,
      immigrationEnabled: r === 'tw' ? get().immigrationEnabled : false,
      immigrationTarget: r === 'tw' ? get().immigrationTarget : null,
      occupationEnabled: occEnabled,
      housingPriceToIncomeRatio: hp.defaultPriceToIncomeRatio,
      housingDownPaymentRatio: hp.defaultDownPaymentRatio,
      housingMortgageYears: hp.defaultMortgageYears,
    })
  },

  applyLifestyle: (id) => {
    const presets = getLifestylePresets(get().region)
    const preset = presets[id]
    set({
      lifestyleId: id,
      annualIncome: preset.annualIncome,
      annualExpense: preset.annualExpense,
      retirementAge: preset.retirementAge,
      initialPortfolio: preset.initialPortfolio,
      annualContribution: preset.annualContribution,
      allocation: { ...preset.allocation },
      withdrawal: preset.withdrawal,
    })
  },

  setAnnualIncome: (v) => set({ annualIncome: v, lifestyleId: 'custom' }),
  setAnnualExpense: (v) => set({ annualExpense: v, lifestyleId: 'custom' }),
  setCurrentAge: (v) => set({ currentAge: v }),
  setRetirementAge: (v) => set({ retirementAge: v, lifestyleId: 'custom' }),
  setEndAge: (v) => set({ endAge: v }),
  setInitialPortfolio: (v) => set({ initialPortfolio: v, lifestyleId: 'custom' }),
  setAnnualContribution: (v) => set({ annualContribution: v, lifestyleId: 'custom' }),
  setAllocation: (a) => set({ allocation: a, lifestyleId: 'custom' }),
  setWithdrawal: (w) => set({ withdrawal: w, lifestyleId: 'custom' }),
  setNumPaths: (n) => set({ numPaths: n }),
  setEnableEvents: (v) => set({ enableEvents: v }),
  setImmigrationEnabled: (v) => set({ immigrationEnabled: v, enableEvents: v ? true : get().enableEvents }),
  setImmigrationTarget: (r) => {
    const presets = r ? getLifestylePresets(r) : getLifestylePresets('jp')
    set({ immigrationTarget: r, immigrationAllocation: { ...presets.moderate.allocation } })
  },
  setImmigrationAge: (v) => set({ immigrationAge: v }),
  setImmigrationAllocation: (a) => set({ immigrationAllocation: a }),
  setOccupationEnabled: (v) => {
    if (isPhilippinesRegion(get().region)) {
      set({ occupationEnabled: false })
      return
    }
    if (v) {
      const defaults = getOccupationDefaults(get().occupationId, get().region)
      set({
        occupationEnabled: true,
        annualIncome: defaults.annualIncome,
        annualContribution: defaults.annualContribution,
        lifestyleId: 'custom',
      })
    } else {
      set({ occupationEnabled: false })
    }
  },
  setOccupationId: (id) => {
    if (isPhilippinesRegion(get().region)) {
      set({ occupationId: id })
      return
    }
    const defaults = getOccupationDefaults(id, get().region)
    set({
      occupationId: id,
      annualIncome: defaults.annualIncome,
      annualContribution: defaults.annualContribution,
      lifestyleId: 'custom',
    })
  },
  setHousingEnabled: (v) => set({ housingEnabled: v }),
  setHousingPurchaseAge: (v) => set({ housingPurchaseAge: v }),
  setHousingPriceToIncomeRatio: (v) => set({ housingPriceToIncomeRatio: v }),
  setHousingDownPaymentRatio: (v) => set({ housingDownPaymentRatio: v }),
  setHousingMortgageYears: (v) => set({ housingMortgageYears: v }),
  setViewMode: (m) => set({ viewMode: m }),

  runSimulation: () => {
    const state = get()
    if (state.isRunning) return

    set({ isRunning: true, progress: 0, result: null })

    if (worker) worker.terminate()
    worker = new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'progress') {
        set({ progress: msg.progress })
      } else if (msg.type === 'done') {
        const done = msg as WorkerDoneMsg
        set({ isRunning: false, progress: 1, result: done.result })
        worker?.terminate()
        worker = null
      }
    }

    worker.onerror = (err) => {
      console.error('Worker error:', err)
      set({ isRunning: false, progress: 0 })
      worker?.terminate()
      worker = null
    }

    const immigrationPlan: ImmigrationPlan | undefined =
      state.immigrationEnabled && state.immigrationTarget
        ? {
            enabled: true,
            originRegion: state.region,
            targetRegion: state.immigrationTarget,
            triggerAge: state.immigrationAge,
            maxAttempts: 3,
            immigrationAllocation: state.immigrationAllocation,
          }
        : undefined

    const housingPlan: HousingPlan | undefined =
      state.housingEnabled
        ? {
            enabled: true,
            purchaseAge: state.housingPurchaseAge,
            priceToIncomeRatio: state.housingPriceToIncomeRatio,
            downPaymentRatio: state.housingDownPaymentRatio,
            mortgageYears: state.housingMortgageYears,
          }
        : undefined

    const occupationPlan: OccupationPlan | undefined =
      state.occupationEnabled
        ? { enabled: true, occupationId: state.occupationId }
        : undefined

    const request: WorkerRequest = {
      type: 'run',
      data: historicalData as HistoricalData,
      params: {
        currentAge: state.currentAge,
        retirementAge: state.retirementAge,
        endAge: state.endAge,
        initialPortfolio: state.initialPortfolio,
        annualContribution: state.annualContribution,
        annualIncome: state.annualIncome,
        allocation: state.allocation,
        withdrawal: state.withdrawal,
        enableEvents: state.enableEvents,
        region: state.region,
        immigrationPlan,
        housingPlan,
        occupationPlan,
      },
      numPaths: state.numPaths,
      masterSeed: Date.now(),
    }

    worker.postMessage(request)
  },

  runStory: () => {
    const state = get()
    set({ isStoryRunning: true, storyResult: null })

    const immigrationPlan: ImmigrationPlan | undefined =
      state.immigrationEnabled && state.immigrationTarget
        ? {
            enabled: true,
            originRegion: state.region,
            targetRegion: state.immigrationTarget,
            triggerAge: state.immigrationAge,
            maxAttempts: 3,
            immigrationAllocation: state.immigrationAllocation,
          }
        : undefined

    const housingPlan: HousingPlan | undefined =
      state.housingEnabled
        ? {
            enabled: true,
            purchaseAge: state.housingPurchaseAge,
            priceToIncomeRatio: state.housingPriceToIncomeRatio,
            downPaymentRatio: state.housingDownPaymentRatio,
            mortgageYears: state.housingMortgageYears,
          }
        : undefined

    const occupationPlan: OccupationPlan | undefined =
      state.occupationEnabled
        ? { enabled: true, occupationId: state.occupationId }
        : undefined

    // 在主執行緒跑單一路徑（有事件紀錄）
    setTimeout(() => {
      const result = simulatePath(
        historicalData as HistoricalData,
        {
          currentAge: state.currentAge,
          retirementAge: state.retirementAge,
          endAge: state.endAge,
          initialPortfolio: state.initialPortfolio,
          annualContribution: state.annualContribution,
          annualIncome: state.annualIncome,
          allocation: state.allocation,
          withdrawal: state.withdrawal,
          enableEvents: true,  // 故事模式強制啟用事件
          region: state.region,
          immigrationPlan,
          housingPlan,
          occupationPlan,
        },
        Date.now(),
      )
      set({ storyResult: result, isStoryRunning: false })
    }, 50)
  },
}), {
  name: 'monte-carlo-sim-params',
  partialize: (state) => ({
    region: state.region,
    lifestyleId: state.lifestyleId,
    annualIncome: state.annualIncome,
    annualExpense: state.annualExpense,
    currentAge: state.currentAge,
    retirementAge: state.retirementAge,
    endAge: state.endAge,
    initialPortfolio: state.initialPortfolio,
    annualContribution: state.annualContribution,
    allocation: state.allocation,
    withdrawal: state.withdrawal,
    numPaths: state.numPaths,
    enableEvents: state.enableEvents,
    immigrationEnabled: state.immigrationEnabled,
    immigrationTarget: state.immigrationTarget,
    immigrationAge: state.immigrationAge,
    immigrationAllocation: state.immigrationAllocation,
    occupationEnabled: state.occupationEnabled,
    occupationId: state.occupationId,
    housingEnabled: state.housingEnabled,
    housingPurchaseAge: state.housingPurchaseAge,
    housingPriceToIncomeRatio: state.housingPriceToIncomeRatio,
    housingDownPaymentRatio: state.housingDownPaymentRatio,
    housingMortgageYears: state.housingMortgageYears,
    viewMode: state.viewMode,
  }),
}))
