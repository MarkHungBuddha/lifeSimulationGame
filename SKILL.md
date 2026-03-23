---
name: monte-carlo-life-simulator
description: >
  完整的蒙地卡羅人生財務模擬遊戲開發技能。當使用者提到蒙地卡羅模擬、
  退休模擬遊戲、財務模擬、Bootstrap 資產報酬、人生模擬器時觸發。
  涵蓋資料層、模擬引擎、事件系統、視覺化四個模組的開發指引。
---

# 蒙地卡羅人生模擬遊戲

## 專案概覽

一款網頁退休財務模擬遊戲。核心體驗：讓玩家觀察「現在的決策」在「長期不確定性」下的結果。
不使用常態分佈假設，而是以真實歷史資料 Bootstrap 重抽樣，保留資產間真實的相關性與肥尾分佈。

---

## 架構總覽

```
assets_returns.json          ← 已完成 ✅
        ↓
Block Bootstrap Engine       ← 下一步
        ↓
Event System                 ← 待開發
        ↓
Monte Carlo Runner           ← 待開發（10,000 paths, Web Worker）
        ↓
Visualization Layer          ← 待開發（Spaghetti Chart, Percentile Bands）
        ↓
React UI / Game Loop         ← 待開發
```

---

## 模組一：資料層（已完成）

### 資料來源
- **美股 (sp500)**：Shiller S&P 500 年度報酬
- **美國長債 (bond)**：10Y Treasury total return
- **黃金 (gold)**：London PM Fix 年度變化
- **現金/短債 (cash)**：3-Month T-Bill
- **REITs (reits)**：NAREIT All REITs Index
- **通膨 (cpi)**：BLS CPI

### 檔案
- `assets_returns.json`：1972–2023，52 年，六個欄位

### 關鍵統計（名目報酬）

| 資產    | 年化平均 | 標準差  | 實質報酬 |
|--------|---------|--------|---------|
| sp500  | 12.22%  | 17.47% | 8.07%   |
| bond   | 8.03%   | 12.26% | 4.01%   |
| gold   | 10.17%  | 26.36% | 5.74%   |
| cash   | 4.47%   | 3.46%  | 0.47%   |
| reits  | 12.89%  | 18.86% | 8.64%   |

### 相關係數重點
- 股票 vs 黃金：**-0.21**（有效對沖）
- 股票 vs REITs：**+0.60**（高度相關，非分散工具）
- 股票 vs 公債：**+0.10**（低相關，分散有效）

### 注意事項
- 統一起點：1972 年（黃金/REITs 最短公分母）
- 各資產必須抽同一年份，保留聯合相關性（不可獨立抽樣）

---

## 模組二：Block Bootstrap 引擎（待開發）

### 為何用 Block Bootstrap
- 放回抽樣會破壞景氣循環的序列相關性
- Block Bootstrap 一次抽連續 3–5 年區塊，保留短期市場動能

### 實作要點

```javascript
// 每次模擬用獨立 seed，保證可重現
const seed = Date.now()
const rng = createSeededRNG(seed)  // 推薦 Mulberry32 或 xoshiro128

function blockBootstrap(data, years, blockSize = 4) {
  const yearKeys = Object.keys(data)  // ['1972', '1973', ...]
  const result = []
  while (result.length < years) {
    // 隨機選一個起始年份
    const startIdx = Math.floor(rng() * (yearKeys.length - blockSize))
    for (let i = 0; i < blockSize && result.length < years; i++) {
      result.push(data[yearKeys[startIdx + i]])
    }
  }
  return result  // 長度 = 模擬年數，保留資產聯合分佈
}
```

### Seed 管理
```javascript
// 每條路徑用不同 seed，但同一次模擬可重現
function runSimulation(params, masterSeed) {
  return Array.from({ length: params.numPaths }, (_, i) => {
    const pathSeed = masterSeed + i
    return simulatePath(params, pathSeed)
  })
}
```

---

## 模組三：事件系統（待開發）

### 事件資料結構
```javascript
const EVENTS = [
  {
    id: 'market_crash',
    name: '市場崩盤',
    probability: 0.05,        // 每年觸發機率
    type: 'market_shock',
    impact: { sp500: -0.35, bond: +0.15, gold: +0.10 },
    duration: 1,
  },
  {
    id: 'medical_emergency',
    name: '重大醫療支出',
    probability: 0.03,
    type: 'expense_shock',
    impact: { expense_one_time: 80000 },
  },
  {
    id: 'career_break',
    name: '職涯中斷',
    probability: 0.02,
    type: 'income_shock',
    impact: { income_multiplier: 0, duration: 2 },
  },
  {
    id: 'inflation_spike',
    name: '通膨飆升',
    probability: 0.04,
    type: 'inflation_shock',
    impact: { cpi_override: 0.12, duration: 2 },
  },
]
```

### 事件觸發邏輯（每年模擬時執行）
```javascript
function rollEvents(rng, year, playerAge) {
  return EVENTS.filter(event => {
    const adjustedProb = adjustByAge(event, playerAge)
    return rng() < adjustedProb
  })
}
```

---

## 模組四：Monte Carlo Runner（待開發）

### 效能建議

| 路徑數    | 執行時間（估計） | 建議方式           |
|----------|--------------|------------------|
| 1,000    | < 1 秒       | 主執行緒           |
| 10,000   | 1–3 秒       | **Web Worker（推薦）** |
| 100,000  | 10+ 秒       | Web Worker 必須    |

### 鎖定目標
- **10,000 路徑**，收斂足夠，體驗流暢
- Web Worker 避免 UI 凍結

### 輸出格式
```javascript
{
  seed: 1748273422,
  successRate: 0.847,          // 50 年未破產比率
  paths: Float32Array[],       // 10000 條路徑，記憶體優化
  percentiles: {
    p10: [...],                // 每年第 10 百分位資產值
    p25: [...],
    p50: [...],
    p75: [...],
    p90: [...],
  },
  medianDepletionYear: null,   // 若成功率 < 50%，資產耗盡中位年份
}
```

---

## 模組五：視覺化（待開發）

### 圖表類型
1. **Spaghetti Chart**：100 條半透明路徑（存活=藍，破產=紅）
2. **Percentile Band Chart**：p10/p50/p90 帶狀圖，主要呈現工具
3. **Success Rate Gauge**：大字顯示存活機率

### 渲染建議
- 10,000 條路徑不渲染全部，只渲染抽樣的 200 條做 Spaghetti
- Percentile bands 用 filled area（recharts 或 D3）
- 考慮 Canvas API 取代 SVG，大量路徑效能更好

---

## 玩法迴圈

```
初始設定（年齡、退休目標、起始資金）
        ↓
資產配置（股/債/金/現金/REITs 比例滑桿）
        ↓
提領策略（4% 法則 / 動態提領 / 固定金額）
        ↓
執行模擬（10,000 次）→ 顯示存活率 + 圖表
        ↓
時間推進 → 隨機事件觸發 → 玩家調整配置
        ↓
（重複直到退休目標年份）
```

---

## 技術棧

- **前端**：React + TypeScript
- **狀態管理**：Zustand（輕量，適合滑桿即時更新）
- **圖表**：Recharts（Percentile bands）+ Canvas（Spaghetti）
- **運算**：Web Worker（模擬引擎隔離）
- **隨機數**：xoshiro128 或 Mulberry32（比 Math.random 快且可 seed）
- **資料**：`assets_returns.json` 靜態打包，不需後端

---

## 開發順序建議

1. ✅ 資料層（`assets_returns.json`）
2. ⬜ Block Bootstrap + Seed RNG 核心
3. ⬜ 單條路徑模擬（含資產配置計算）
4. ⬜ 批次 10,000 路徑 + Web Worker
5. ⬜ 基本 UI（滑桿 + 存活率數字）
6. ⬜ Percentile Band 圖表
7. ⬜ 事件系統
8. ⬜ Spaghetti Chart + 動畫
9. ⬜ 完整遊戲迴圈
