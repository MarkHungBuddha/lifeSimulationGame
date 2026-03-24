---
name: monte-carlo-life-simulator
description: >
  完整的蒙地卡羅人生財務模擬遊戲開發技能。當使用者提到蒙地卡羅模擬、
  退休模擬遊戲、財務模擬、Bootstrap 資產報酬、人生模擬器時觸發。
  涵蓋資料層、模擬引擎、事件系統、移民模組、購屋模組、視覺化六個模組的開發指引。
---

# 蒙地卡羅人生模擬遊戲 — 專案知識庫

## 專案概覽

一款網頁退休財務模擬遊戲。核心體驗：讓玩家觀察「現在的決策」在「長期不確定性」下的結果。
不使用常態分佈假設，而是以真實歷史資料 Block Bootstrap 重抽樣，保留資產間真實的相關性與肥尾分佈。

**支援三國**：美國 (USD)、台灣 (TWD)、日本 (JPY)
**雙模式**：批次蒙地卡羅模擬（10,000 路徑）+ 單條路徑人生故事

---

## 架構總覽

```
data/assets_returns.json         ← 歷史報酬資料 (1972-2023)
        ↓
Block Bootstrap Engine           ← src/engine/bootstrap.ts
        ↓
Single Path Simulator            ← src/engine/simulator.ts
  ├── Immigration Engine         ← src/engine/immigrationEngine.ts
  ├── Housing Engine             ← src/engine/housingEngine.ts
  └── Event Engine               ← src/events/eventEngine.ts
        ↓
Monte Carlo Runner + Worker      ← src/engine/runner.ts, worker.ts
        ↓
React UI (MUI v7)
  ├── Controls.tsx               ← 參數控制面板
  ├── ResultPanel.tsx            ← 批次模擬結果
  └── StoryPanel.tsx             ← 人生故事時間線
        ↓
Zustand Store                    ← src/store/gameStore.ts
```

---

## 檔案結構

```
src/
├── App.tsx                      # AppBar + Drawer 響應式佈局
├── main.tsx                     # React 進入點 + MUI Theme
├── ThemeContext.tsx              # Dark/Light 模式切換
├── config/
│   └── regions.ts               # 三國設定（幣值、標籤、滑桿範圍）
├── engine/
│   ├── index.ts                 # 統一匯出
│   ├── rng.ts                   # xoshiro128** PRNG
│   ├── bootstrap.ts             # Block Bootstrap 重抽樣
│   ├── simulator.ts             # 單條路徑模擬器（核心迴圈）
│   ├── runner.ts                # Monte Carlo 批次模擬
│   ├── worker.ts                # Web Worker 包裝
│   ├── lifestyle.ts             # 美國生活風格預設
│   ├── lifestyle_tw.ts          # 台灣生活風格預設
│   ├── lifestyle_jp.ts          # 日本生活風格預設
│   ├── immigrationEngine.ts     # 移民狀態機引擎
│   ├── immigrationTypes.ts      # 移民型別定義
│   ├── immigrationData.ts       # 移民路線參數（TW→JP、TW→US）
│   ├── housingEngine.ts         # 購屋模擬引擎
│   ├── housingTypes.ts          # 購屋型別定義
│   └── housingData.ts           # 三國購屋參數
├── events/
│   ├── eventTypes.ts            # 事件型別定義
│   ├── eventEngine.ts           # 事件觸發引擎
│   ├── eventDatabase.ts         # 美國事件資料庫
│   ├── eventDatabase_tw.ts      # 台灣事件資料庫
│   └── eventDatabase_jp.ts      # 日本事件資料庫
├── components/
│   ├── Controls.tsx             # 參數控制面板（所有設定）
│   ├── ResultPanel.tsx          # 批次模擬結果（圖表+統計）
│   └── StoryPanel.tsx           # 人生故事時間線
└── store/
    └── gameStore.ts             # Zustand 全域狀態

data/
└── assets_returns.json          # 歷史報酬資料（1972-2024）

monte_carlo_*.md                 # 各模組參考文件（參數來源）
```

---

## 模組一：資料層

### 資料來源
- **美股 (sp500)**：Shiller S&P 500 年度報酬
- **美國長債 (bond)**：10Y Treasury total return
- **黃金 (gold)**：London PM Fix 年度變化
- **現金/短債 (cash)**：3-Month T-Bill
- **REITs (reits)**：NAREIT All REITs Index
- **通膨 (cpi)**：BLS CPI

### 關鍵統計（名目報酬）

| 資產 | 年化平均 | 標準差 | 實質報酬 |
|------|---------|--------|---------|
| sp500 | 12.22% | 17.47% | 8.07% |
| bond | 8.03% | 12.26% | 4.01% |
| gold | 10.17% | 26.36% | 5.74% |
| cash | 4.47% | 3.46% | 0.47% |
| reits | 12.89% | 18.86% | 8.64% |

### 相關係數重點
- 股票 vs 黃金：**-0.21**（有效對沖）
- 股票 vs REITs：**+0.60**（高度相關）
- 股票 vs 公債：**+0.10**（低相關，分散有效）

---

## 模組二：模擬引擎

### Block Bootstrap (`bootstrap.ts`)
- Block size = 4 年（保留景氣循環序列相關性）
- 各資產必須抽同一年份，保留聯合相關性
- xoshiro128** seeded PRNG，每條路徑 seed 不同

### 單條路徑模擬器 (`simulator.ts`)

**每年模擬步驟**（按順序）：
1. Block Bootstrap 抽出該年各資產報酬
2. 累計通膨：`cumulativeInflation *= (1 + cpi)`
3. **移民處理**：檢查階段轉換、收入/支出倍率、移民成本
4. **隨機事件**：擲骰觸發事件、計算財務影響
5. **購屋處理**：檢查購屋條件、扣頭期款、計算房貸
6. 退休前：加入年存款（扣除房貸後，通膨調整）
7. 計算加權報酬：`portfolio *= (1 + weightedReturn)`
8. 退休後：扣除提領金額 + 房屋支出
9. 扣除事件額外支出
10. 破產檢查（資產 ≤ 0）

### 核心介面

```typescript
interface SimulationParams {
  currentAge, retirementAge, endAge: number
  initialPortfolio, annualContribution, annualIncome: number
  allocation: Allocation          // { sp500, intlStock, bond, gold, cash, reits }
  withdrawal: WithdrawalStrategy  // fixed_rate | fixed_amount | dynamic
  enableEvents: boolean
  region?: Region                 // 'us' | 'tw' | 'jp'
  immigrationPlan?: ImmigrationPlan
  housingPlan?: HousingPlan
}

interface YearSnapshot {
  age, year: number
  portfolioStart, portfolioEnd: number
  weightedReturn, contribution, withdrawal: number
  events: TriggeredEvent[]
  immigrationPhase?: ImmigrationPhase
  activeRegion?: Region
  housing?: YearHousingSnapshot
}
```

### 三種提領策略
- `fixed_rate`：初始資產 × rate × 累計通膨（4% 法則）
- `fixed_amount`：固定金額 × 累計通膨
- `dynamic`：當前資產 4%，設上下限（通膨調整）

---

## 模組三：移民系統

### 狀態機流程
```
none → preparing → visa_applying → transition → settled → permanent
                        ↓                              ↓
                   visa_failed                    forced_return
                        ↓
                   (retry / abandoned)
```

### 兩條路線

| 參數 | TW→JP | TW→US |
|------|-------|-------|
| 簽證成功率 | 85% (COE) | 25% (H-1B) |
| 永住最快 | 1-3 年 (HSP) | 3 年 (EB-2) |
| 收入倍率 | 1.4x | 3.5x |
| 支出倍率 | 1.6x | 3.0x |

### 關鍵檔案
- `immigrationEngine.ts` — 狀態機邏輯
- `immigrationTypes.ts` — 型別定義（ImmigrationPlan, ImmigrationState）
- `immigrationData.ts` — 路線參數（ROUTE_TW_TO_JP, ROUTE_TW_TO_US）

---

## 模組四：購屋系統

### 運作方式
1. 使用者設定：購屋年齡、房價所得比、頭期款比例、房貸年限
2. 達到購屋年齡且 portfolio 足夠 → 購屋
3. 扣除頭期款 + 交易成本（一次性從 portfolio 扣除）
4. 每年房貸本息 + 持有成本（從年投資額扣除/退休後從提領額增加）
5. 房價每年隨機漲跌（常態分布，各國不同均值/標準差）
6. 房貸繳清後只剩持有成本

### 三國購屋參數

| 參數 | 台灣 | 日本 | 美國 |
|------|------|------|------|
| 房貸利率 | 2.5% | 0.5% | 6.8% |
| 交易成本 | 4% | 8% | 3% |
| 年持有成本 | 1% | 2.2% | 2.5% |
| 房價年漲幅 μ | 4% | 2% | 3% |
| 房價年漲幅 σ | 8% | 6% | 7% |
| 預設房價所得比 | 12x | 10x | 8x |

### PMT 公式（等額本息）
```
年付 = 本金 × r × (1+r)^n / ((1+r)^n - 1)
```

### 關鍵檔案
- `housingEngine.ts` — 購屋模擬引擎（processHousingYear）
- `housingTypes.ts` — 型別定義（HousingPlan, HousingState, YearHousingSnapshot）
- `housingData.ts` — 三國參數（HOUSING_PARAMS）

---

## 模組五：隨機事件系統

### 事件結構
```typescript
interface RandomEvent {
  id, name, description: string
  category: EventCategory              // market|career|health|family|property|legal|immigration
  baseProbability: number              // 基礎年機率
  ageProbabilities?: AgeProbability[]  // 年齡調整機率
  impacts: EventImpact[]              // 財務影響
  correlatedWith?: string[]           // 相關事件 ID
  isPositive?: boolean                // 正面事件
  housingCondition?: 'owner_only' | 'renter_only'  // 購屋條件
  ownerProbabilityMultiplier?: number               // 有房者機率倍數
  ownerExtraImpacts?: EventImpact[]                 // 有房者額外影響
}
```

### 影響類型
- `income_change` — 收入百分比變化（暫時）
- `portfolio_change` — 投資組合百分比變化
- `savings_change` — 儲蓄百分比變化
- `extra_expense` — 額外支出（月收入倍數）
- `income_boost` — 收入永久增加
- `savings_boost` — 儲蓄一次性增加/減少

### 事件觸發流程
1. 第一輪：每個事件獨立擲骰子（根據年齡調整機率）
2. 第二輪：已觸發事件可拉動相關事件（50% 額外機率）
3. 計算實際影響金額
4. 年度保護上限：資產損失 ≤ -30%，額外支出 ≤ 3 個月收入

### 購屋整合
- `housingCondition: 'owner_only'`：僅有房者觸發（如重大維修、利率上升）
- `housingCondition: 'renter_only'`：僅租屋者觸發（如房租調漲）
- `ownerProbabilityMultiplier`：有房者機率倍增（如天災損害 2x）
- `ownerExtraImpacts`：有房者受到更大衝擊（如地震額外修繕費）
- 購屋模組啟用時跳過 `tw_purchase_home` / `jp_purchase_home`

### 退休後跳過
- 所有 career 類別事件
- 特定工作相關事件 ID（layoff, promotion, burnout 等）

### 三國事件數量
- 美國：~30 種事件
- 台灣：~30 種事件（台海地緣政治、健保降低醫療風險等）
- 日本：~30 種事件（BOJ 利上げ、地震、過労等）

---

## 模組六：UI 層

### 控制面板 (`Controls.tsx`)

**區段順序**：
1. 地區切換（US / TW / JP）
2. 生活風格預設（6 種卡片）
3. 收支概況（年收入、年開銷、年投資）+ 儲蓄率/月開銷
4. 基本設定（年齡、退休年齡、模擬結束、起始資產）
5. 資產配置（6 種資產滑桿 + 歸零按鈕 + 總和驗證）
6. 提領策略（Select + 條件性滑桿）
7. 隨機事件開關
8. **購屋計畫**（開關 + 購屋年齡 + 房價所得比 + 頭期款 + 房貸年限 + 即時預估）
9. 移民計畫（僅台灣版，開關 + 目標國 + 年齡 + 投資配置）
10. 模擬設定（路徑數）
11. 頁面切換（批次模擬 / 人生故事）
12. 執行按鈕

### 結果面板 (`ResultPanel.tsx`)
- 生活風格摘要
- 成功率 Hero（顏色語義：≥80% 綠、≥50% 黃、<50% 紅）
- 統計卡片（中位最終資產、中位破產年齡、P90/P10）
- 最大跌幅卡片（中位、P75、P90、最大）
- Percentile Band Chart（Canvas，HiDPI）
- Percentile 表格（每 5 年一行，退休年齡高亮）

### 人生故事面板 (`StoryPanel.tsx`)
- 結局 Hero（財務存活/破產）
- 移民結果摘要
- 購屋結果摘要（房屋市值、淨值、房貸餘額）
- 資產走勢迷你圖（Canvas）
- 時間線（Timeline）：每年事件、購屋標記、資產變化

---

## 模組七：狀態管理 (`gameStore.ts`)

### Zustand Store 結構
```typescript
interface GameState {
  // 地區
  region: Region

  // 生活風格
  lifestyleId: LifestyleId
  annualIncome, annualExpense: number

  // 模擬參數
  currentAge, retirementAge, endAge: number
  initialPortfolio, annualContribution: number
  allocation: Allocation
  withdrawal: WithdrawalStrategy
  numPaths: number
  enableEvents: boolean

  // 移民
  immigrationEnabled: boolean
  immigrationTarget: Region | null
  immigrationAge: number
  immigrationAllocation: Allocation

  // 購屋
  housingEnabled: boolean
  housingPurchaseAge: number
  housingPriceToIncomeRatio: number
  housingDownPaymentRatio: number
  housingMortgageYears: number

  // 模擬結果
  result: SimResult | null
  storyResult: PathResult | null
}
```

---

## 地區設定 (`regions.ts`)

### Region 型別
```typescript
type Region = 'us' | 'tw' | 'jp'
```

### 各國差異
- **貨幣格式**：US `$K/M`、TW `NT$萬/億`、JP `¥万/億`
- **滑桿範圍**：各國獨立（如台灣年收入 40-600 萬、美國 $20K-$500K）
- **資產標籤**：台灣「台股加權」、日本「日本株」、美國「S&P 500」
- **intlStock**：海外股票，使用 sp500 歷史報酬作為代理

---

## 開發模式與慣例

### 新增模組的標準流程
1. 定義型別（`xxxTypes.ts`）— 介面、初始狀態
2. 定義參數（`xxxData.ts`）— 三國參數
3. 實作引擎（`xxxEngine.ts`）— 年度處理函數
4. 整合到 `simulator.ts` — 在年度迴圈中呼叫
5. 更新 `gameStore.ts` — 新增狀態與 actions
6. 更新 `Controls.tsx` — 新增 UI 控制元件
7. 更新 `StoryPanel.tsx` — 顯示結果
8. 更新事件系統 — 新增/調整相關事件

### 設計模式
- **Seeded RNG**：每個子系統用獨立 seed（`seed * 質數 + 偏移`）
- **通膨調整**：所有貨幣值乘以 `cumulativeInflation`
- **狀態機**：多階段流程用 phase enum 追蹤
- **地區感知**：所有參數都有 TW/JP/US 變體
- **年度快照**：每年完整記錄狀態，非只記差異
- **Web Worker**：重計算用 Worker，只回傳統計結果

### 注意事項
- 配置總和驗證：6 種資產權重必須加總 = 100% ± 0.1%
- RNG 序列一致：跳過事件時仍需消耗 `rng()` 以保持後續序列不變
- 年度保護上限：事件影響有上限（-30% 資產、3 月收入支出）
- 購屋 vs 事件順序：事件在購屋之前處理，使用上一年的 housingState

---

## 技術決策紀錄

| 決策 | 選擇 | 理由 |
|-----|------|------|
| 資料策略 | Block Bootstrap | 保留真實相關性與肥尾 |
| 歷史起點 | 1972 | 五資產最短公分母 |
| Bootstrap block size | 4 年 | 平衡序列相關性與樣本多樣性 |
| 模擬路徑數 | 10,000 | 收斂足夠，1-3 秒可接受 |
| 運算方式 | Web Worker | 避免 UI 凍結 |
| RNG | xoshiro128** | 可 seed、快、週期長 |
| 圖表 | Canvas API | HiDPI 支援，大量路徑效能好 |
| UI 框架 | MUI v7 | Material Design，響應式 |
| 狀態管理 | Zustand | 輕量，適合滑桿即時更新 |
| 建構工具 | Vite 8 | 快速 HMR，原生 ES module |
| 後端 | 無 | 純前端，JSON 靜態打包 |

---

## 參考資料文件

| 檔案 | 用途 |
|------|------|
| `monte_carlo_housing.md` | 三國購屋參數來源（房價、利率、稅務、隨機事件） |
| `monte_carlo_immigration.md` | 移民模組參數來源 |
| `monte_carlo_investment_tw_jp.md` | 台灣/日本投資參數來源 |
| `monte_carlo_japan.md` | 日本版模擬參數來源 |
| `monte_carlo_taiwan.md` | 台灣版模擬參數來源 |
| `monte_carlo_random_events.md` | 隨機事件參數來源 |
