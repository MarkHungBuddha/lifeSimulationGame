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
Block Bootstrap Engine       ← 已完成 ✅ (src/engine/bootstrap.ts)
        ↓
Single Path Simulator        ← 已完成 ✅ (src/engine/simulator.ts)
        ↓
Monte Carlo Runner           ← 已完成 ✅ (src/engine/runner.ts, 10,000 paths)
        ↓
Web Worker                   ← 已完成 ✅ (src/engine/worker.ts)
        ↓
Visualization Layer          ← 已完成 ✅ (Canvas Percentile Band Chart)
        ↓
React UI (MUI)               ← 已完成 ✅ (Controls + ResultPanel)
        ↓
Event System                 ← 待開發
        ↓
Spaghetti Chart              ← 待開發
        ↓
Game Loop                    ← 待開發
```

---

## 模組一：資料層（已完成 ✅）

### 資料來源
- **美股 (sp500)**：Shiller S&P 500 年度報酬
- **美國長債 (bond)**：10Y Treasury total return
- **黃金 (gold)**：London PM Fix 年度變化
- **現金/短債 (cash)**：3-Month T-Bill
- **REITs (reits)**：NAREIT All REITs Index
- **通膨 (cpi)**：BLS CPI

### 檔案
- `data/assets_returns.json`：1972–2023，52 年，六個欄位（含 real 報酬）

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

## 模組二：Block Bootstrap 引擎（已完成 ✅）

### 實作檔案
- `src/engine/rng.ts` — xoshiro128** seeded PRNG
- `src/engine/bootstrap.ts` — Block Bootstrap 重抽樣

### 設計決策
- **RNG**：xoshiro128**（splitmix32 展開 seed → 4 個 32-bit 狀態）
- **Block size**：4 年（平衡序列相關性與樣本多樣性）
- **Seed 管理**：每條路徑 seed = masterSeed + pathIndex，保證可重現

### 介面
```typescript
createSeededRNG(seed: number): () => number  // [0, 1)
blockBootstrap(data, years, seed, blockSize?): YearReturns[]
```

---

## 模組三：單條路徑模擬器（已完成 ✅）

### 實作檔案
- `src/engine/simulator.ts`

### 每年模擬步驟
1. Block Bootstrap 抽出該年各資產報酬
2. 累計通膨：`cumulativeInflation *= (1 + cpi)`
3. 退休前：加入年存款（通膨調整）
4. 計算加權報酬：`portfolio *= (1 + weightedReturn)`
5. 退休後：扣除提領金額（通膨調整）
6. 破產檢查（資產 ≤ 0）

### 三種提領策略
- `fixed_rate`：4% 法則（初始資產 × rate × 累計通膨）
- `fixed_amount`：固定金額（通膨調整）
- `dynamic`：當前資產 4%，設上下限（通膨調整）

### 介面
```typescript
simulatePath(data, params, seed): PathResult
// PathResult: { seed, snapshots[], finalPortfolio, bankrupt, bankruptAge }
```

---

## 模組四：Monte Carlo Runner + Web Worker（已完成 ✅）

### 實作檔案
- `src/engine/runner.ts` — 批次模擬 + percentile 計算
- `src/engine/worker.ts` — Web Worker 包裝

### 功能
- 執行 N 條路徑（預設 10,000）
- 計算 percentile（p10/p25/p50/p75/p90）每年資產值
- 計算成功率（未破產比率）
- 進度回呼（每 500 條路徑）
- Worker 只回傳統計結果（不傳完整 paths，節省記憶體）

### 介面
```typescript
runMonteCarlo(data, params, numPaths?, masterSeed?, onProgress?): MonteCarloResult
// Worker 訊息：{ type: 'run', ... } → { type: 'progress' | 'done', ... }
```

---

## 模組五：視覺化（部分完成）

### 已完成 ✅
- **Percentile Band Chart**（Canvas，HiDPI 支援）
  - P10–P90 淺色帶、P25–P75 深色帶、P50 實線
  - 退休年齡虛線標記
  - MUI 主題色彩
- **成功率 Hero**：大字顯示 + 顏色語義（綠/黃/紅）
- **統計卡片**：中位最終資產、中位破產年齡、P90/P10 最終資產
- **Percentile 表格**：每 5 年一行，退休年齡高亮

### 待開發 ⬜
- **Spaghetti Chart**（Canvas，抽樣 200 條路徑）
- **Percentile / Spaghetti 切換**

---

## 模組六：UI 層（已完成 ✅）

### 實作檔案
- `src/main.tsx` — MUI ThemeProvider + Noto Sans TC
- `src/App.tsx` — AppBar + Drawer 響應式佈局
- `src/components/Controls.tsx` — 參數控制面板
- `src/components/ResultPanel.tsx` — 結果顯示面板
- `src/store/gameStore.ts` — Zustand 狀態管理

### UI 設計
- **Material Design** — MUI v7 元件
- **響應式**：桌面 permanent Drawer，手機漢堡選單
- **控制面板**：MUI Slider（資產配置各有獨立色彩）、Select、Button
- **進度條**：LinearProgress + 百分比顯示

---

## 模組七：事件系統（待開發 ⬜）

### 事件資料結構
```javascript
const EVENTS = [
  { id: 'market_crash', name: '市場崩盤', probability: 0.05, type: 'market_shock',
    impact: { sp500: -0.35, bond: +0.15, gold: +0.10 }, duration: 1 },
  { id: 'medical_emergency', name: '重大醫療支出', probability: 0.03, type: 'expense_shock',
    impact: { expense_one_time: 80000 } },
  { id: 'career_break', name: '職涯中斷', probability: 0.02, type: 'income_shock',
    impact: { income_multiplier: 0, duration: 2 } },
  { id: 'inflation_spike', name: '通膨飆升', probability: 0.04, type: 'inflation_shock',
    impact: { cpi_override: 0.12, duration: 2 } },
]
```

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

- **前端**：React 19 + TypeScript
- **UI 框架**：MUI v7（Material Design）
- **狀態管理**：Zustand
- **圖表**：Canvas API（Percentile Band Chart）
- **運算**：Web Worker（模擬引擎隔離）
- **隨機數**：xoshiro128**（可 seed、比 Math.random 快）
- **建構工具**：Vite 8
- **測試**：Vitest（16 個測試覆蓋 RNG / Bootstrap / Simulator）
- **資料**：`assets_returns.json` 靜態打包，不需後端
- **字型**：Noto Sans TC + Roboto

---

## 開發順序

1. ✅ 資料層（`assets_returns.json`）
2. ✅ Block Bootstrap + Seed RNG 核心（`rng.ts`, `bootstrap.ts`）
3. ✅ 單條路徑模擬（`simulator.ts`，含資產配置、通膨調整、三種提領策略）
4. ✅ 批次 10,000 路徑 + Web Worker（`runner.ts`, `worker.ts`）
5. ✅ 基本 UI — MUI Material Design（Controls + ResultPanel + Zustand）
6. ✅ Percentile Band Chart（Canvas，HiDPI，退休線標記）
7. ⬜ 事件系統
8. ⬜ Spaghetti Chart + 動畫
9. ⬜ 完整遊戲迴圈
