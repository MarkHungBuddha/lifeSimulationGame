/**
 * Web Worker — 在背景執行緒跑 Monte Carlo 模擬
 */

import { runMonteCarlo } from './runner'
import type { HistoricalData } from './bootstrap'
import type { SimulationParams } from './simulator'

export interface WorkerRequest {
  type: 'run'
  data: HistoricalData
  params: SimulationParams
  numPaths: number
  masterSeed: number
}

export interface WorkerProgressMsg {
  type: 'progress'
  progress: number
}

export interface WorkerDoneMsg {
  type: 'done'
  result: {
    masterSeed: number
    numPaths: number
    successRate: number
    percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] }
    medianFinalPortfolio: number
    medianDepletionAge: number | null
    maxDrawdown: { median: number; p75: number; p90: number; worst: number }
    eventsEnabled: boolean
  }
}

export type WorkerResponse = WorkerProgressMsg | WorkerDoneMsg

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { data, params, numPaths, masterSeed } = e.data

  const result = runMonteCarlo(data, params, numPaths, masterSeed, (progress) => {
    self.postMessage({ type: 'progress', progress } satisfies WorkerProgressMsg)
  })

  self.postMessage({
    type: 'done',
    result: {
      masterSeed: result.masterSeed,
      numPaths: result.numPaths,
      successRate: result.successRate,
      percentiles: result.percentiles,
      medianFinalPortfolio: result.medianFinalPortfolio,
      medianDepletionAge: result.medianDepletionAge,
      maxDrawdown: result.maxDrawdown,
      eventsEnabled: params.enableEvents,
    },
  } satisfies WorkerDoneMsg)
}
