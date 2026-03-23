import { create } from 'zustand'
import type { Allocation, WithdrawalStrategy } from '../engine/simulator'
import type { WorkerDoneMsg, WorkerRequest } from '../engine/worker'
import historicalData from '../../data/assets_returns.json'
import type { HistoricalData } from '../engine/bootstrap'

interface SimResult {
  successRate: number
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] }
  medianFinalPortfolio: number
  medianDepletionAge: number | null
  numPaths: number
  masterSeed: number
}

interface GameState {
  // 參數
  currentAge: number
  retirementAge: number
  endAge: number
  initialPortfolio: number
  annualContribution: number
  allocation: Allocation
  withdrawal: WithdrawalStrategy
  numPaths: number

  // 狀態
  isRunning: boolean
  progress: number
  result: SimResult | null

  // Actions
  setCurrentAge: (v: number) => void
  setRetirementAge: (v: number) => void
  setEndAge: (v: number) => void
  setInitialPortfolio: (v: number) => void
  setAnnualContribution: (v: number) => void
  setAllocation: (a: Allocation) => void
  setWithdrawal: (w: WithdrawalStrategy) => void
  setNumPaths: (n: number) => void
  runSimulation: () => void
}

let worker: Worker | null = null

export const useGameStore = create<GameState>((set, get) => ({
  currentAge: 30,
  retirementAge: 65,
  endAge: 95,
  initialPortfolio: 100000,
  annualContribution: 20000,
  allocation: { sp500: 0.6, bond: 0.2, gold: 0.1, cash: 0.05, reits: 0.05 },
  withdrawal: { type: 'fixed_rate', rate: 0.04 },
  numPaths: 10000,

  isRunning: false,
  progress: 0,
  result: null,

  setCurrentAge: (v) => set({ currentAge: v }),
  setRetirementAge: (v) => set({ retirementAge: v }),
  setEndAge: (v) => set({ endAge: v }),
  setInitialPortfolio: (v) => set({ initialPortfolio: v }),
  setAnnualContribution: (v) => set({ annualContribution: v }),
  setAllocation: (a) => set({ allocation: a }),
  setWithdrawal: (w) => set({ withdrawal: w }),
  setNumPaths: (n) => set({ numPaths: n }),

  runSimulation: () => {
    const state = get()
    if (state.isRunning) return

    set({ isRunning: true, progress: 0, result: null })

    // 終止前一個 worker
    if (worker) worker.terminate()
    worker = new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'progress') {
        set({ progress: msg.progress })
      } else if (msg.type === 'done') {
        const done = msg as WorkerDoneMsg
        set({
          isRunning: false,
          progress: 1,
          result: done.result,
        })
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
        allocation: state.allocation,
        withdrawal: state.withdrawal,
      },
      numPaths: state.numPaths,
      masterSeed: Date.now(),
    }

    worker.postMessage(request)
  },
}))
