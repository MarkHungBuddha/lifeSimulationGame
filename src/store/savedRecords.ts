/**
 * 儲存紀錄管理
 * 使用 localStorage 顯式儲存/載入模擬參數組合
 */

import { create } from 'zustand'
import type { Allocation, WithdrawalStrategy } from '../engine/simulator'
import type { Region } from '../config/regions'
import type { LifestyleId } from '../engine/lifestyle'

/** 可儲存的參數快照 */
export interface SavedRecord {
  id: string
  name: string
  savedAt: number  // timestamp
  region: Region
  lifestyleId: LifestyleId
  annualIncome: number
  annualExpense: number
  currentAge: number
  retirementAge: number
  endAge: number
  initialPortfolio: number
  annualContribution: number
  allocation: Allocation
  withdrawal: WithdrawalStrategy
  numPaths: number
  enableEvents: boolean
  immigrationEnabled: boolean
  immigrationTarget: Region | null
  immigrationAge: number
  immigrationAllocation: Allocation
  occupationEnabled: boolean
  occupationId: number
  housingEnabled: boolean
  housingPurchaseAge: number
  housingPriceToIncomeRatio: number
  housingDownPaymentRatio: number
  housingMortgageYears: number
  // 模擬結果摘要（如果有的話）
  resultSummary?: {
    successRate: number
    medianFinalPortfolio: number
  }
}

const STORAGE_KEY = 'monte-carlo-saved-records'

function loadRecords(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistRecords(records: SavedRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

interface SavedRecordsState {
  records: SavedRecord[]
  saveRecord: (record: Omit<SavedRecord, 'id' | 'savedAt'>) => void
  deleteRecord: (id: string) => void
  renameRecord: (id: string, name: string) => void
}

export const useSavedRecords = create<SavedRecordsState>((set, get) => ({
  records: loadRecords(),

  saveRecord: (record) => {
    const newRecord: SavedRecord = {
      ...record,
      id: crypto.randomUUID(),
      savedAt: Date.now(),
    }
    const updated = [newRecord, ...get().records]
    persistRecords(updated)
    set({ records: updated })
  },

  deleteRecord: (id) => {
    const updated = get().records.filter(r => r.id !== id)
    persistRecords(updated)
    set({ records: updated })
  },

  renameRecord: (id, name) => {
    const updated = get().records.map(r => r.id === id ? { ...r, name } : r)
    persistRecords(updated)
    set({ records: updated })
  },
}))
