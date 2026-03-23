import { create } from 'zustand'
import type { Allocation, WithdrawalStrategy, PathResult } from '../engine/simulator'
import { simulatePath } from '../engine/simulator'
import type { WorkerDoneMsg, WorkerRequest } from '../engine/worker'
import { LIFESTYLE_PRESETS, type LifestyleId } from '../engine/lifestyle'
import { LIFESTYLE_PRESETS_TW } from '../engine/lifestyle_tw'
import type { Region } from '../config/regions'
import historicalData from '../../data/assets_returns.json'
import type { HistoricalData } from '../engine/bootstrap'

function getLifestylePresets(region: Region) {
  return region === 'tw' ? LIFESTYLE_PRESETS_TW : LIFESTYLE_PRESETS
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
  setViewMode: (m: ViewMode) => void
  runSimulation: () => void
  runStory: () => void
}

let worker: Worker | null = null

const defaultPreset = LIFESTYLE_PRESETS.moderate

export const useGameStore = create<GameState>((set, get) => ({
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

  viewMode: 'simulation',

  isRunning: false,
  progress: 0,
  result: null,

  storyResult: null,
  isStoryRunning: false,

  setRegion: (r) => {
    const presets = getLifestylePresets(r)
    const preset = presets.moderate
    set({
      region: r,
      lifestyleId: 'moderate',
      annualIncome: preset.annualIncome,
      annualExpense: preset.annualExpense,
      retirementAge: preset.retirementAge,
      initialPortfolio: preset.initialPortfolio,
      annualContribution: preset.annualContribution,
      allocation: { ...preset.allocation },
      withdrawal: preset.withdrawal,
      result: null,
      storyResult: null,
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
      },
      numPaths: state.numPaths,
      masterSeed: Date.now(),
    }

    worker.postMessage(request)
  },

  runStory: () => {
    const state = get()
    set({ isStoryRunning: true, storyResult: null })

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
        },
        Date.now(),
      )
      set({ storyResult: result, isStoryRunning: false })
    }, 50)
  },
}))
