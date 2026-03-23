/**
 * Block Bootstrap 重抽樣引擎
 *
 * 為何用 Block Bootstrap：
 * - 單純放回抽樣會破壞景氣循環的序列相關性
 * - 一次抽連續 blockSize 年的區塊，保留短期市場動能
 * - 所有資產抽同一年份，保留聯合分佈（股災時黃金上漲等真實關係）
 */

import { createSeededRNG } from './rng'

/** 單一年份的所有資產報酬 */
export interface YearReturns {
  sp500: number
  bond: number
  gold: number
  cash: number
  reits: number
  cpi: number
}

/** 原始歷史資料格式：年份字串 → 報酬物件 */
export type HistoricalData = Record<string, YearReturns>

/**
 * Block Bootstrap 重抽樣
 *
 * @param data       歷史資料（assets_returns.json）
 * @param years      需要模擬的年數
 * @param seed       隨機種子
 * @param blockSize  區塊大小（預設 4 年）
 * @returns          長度為 years 的報酬序列
 */
export function blockBootstrap(
  data: HistoricalData,
  years: number,
  seed: number,
  blockSize: number = 4,
): YearReturns[] {
  const rng = createSeededRNG(seed)
  const yearKeys = Object.keys(data).sort() // ['1972', '1973', ...]
  const n = yearKeys.length // 52

  // 最大起始索引：確保區塊不超出範圍
  const maxStart = n - blockSize

  const result: YearReturns[] = []

  while (result.length < years) {
    // 隨機選一個起始位置
    const startIdx = Math.floor(rng() * (maxStart + 1))

    // 抽出連續 blockSize 年
    for (let i = 0; i < blockSize && result.length < years; i++) {
      const yearKey = yearKeys[startIdx + i]
      const raw = data[yearKey]
      // 只保留模擬需要的六個名目報酬欄位
      result.push({
        sp500: raw.sp500,
        bond: raw.bond,
        gold: raw.gold,
        cash: raw.cash,
        reits: raw.reits,
        cpi: raw.cpi,
      })
    }
  }

  return result
}
