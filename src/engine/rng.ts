/**
 * Seeded pseudo-random number generator — xoshiro128**
 *
 * 特性：
 * - 同一 seed 永遠產出相同序列（可重現）
 * - 比 Math.random 快，週期長（2^128 - 1）
 * - 適合 Monte Carlo 模擬大量抽樣
 */

/** 將任意整數 seed 透過 splitmix32 展開為 4 個 32-bit 狀態 */
function splitmix32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x9e3779b9) | 0
    let t = seed ^ (seed >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    t = t ^ (t >>> 15)
    return t >>> 0
  }
}

/**
 * 建立 xoshiro128** PRNG
 * @param seed 整數種子，相同 seed 保證相同序列
 * @returns 回傳 [0, 1) 的浮點數產生器
 */
export function createSeededRNG(seed: number): () => number {
  // 用 splitmix32 從單一 seed 產生 4 個初始狀態
  const sm = splitmix32(seed)
  let s0 = sm()
  let s1 = sm()
  let s2 = sm()
  let s3 = sm()

  return () => {
    // xoshiro128** 核心演算法
    const result = Math.imul(rotl(Math.imul(s1, 5), 7), 9)

    const t = s1 << 9
    s2 ^= s0
    s3 ^= s1
    s1 ^= s2
    s0 ^= s3
    s2 ^= t
    s3 = rotl(s3, 11)

    return (result >>> 0) / 0x100000000 // 轉為 [0, 1)
  }
}

/** 32-bit 左旋轉 */
function rotl(x: number, k: number): number {
  return (x << k) | (x >>> (32 - k))
}
