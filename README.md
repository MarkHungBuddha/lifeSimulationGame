# 蒙地卡羅人生模擬遊戲

一款網頁退休財務模擬遊戲。核心體驗：讓玩家觀察「現在的決策」在「長期不確定性」下的結果。

不使用常態分佈假設，而是以真實歷史資料 **Block Bootstrap 重抽樣**，保留資產間真實的相關性與肥尾分佈。

## 特色

- **歷史資料驅動** — 1972–2023 共 52 年，涵蓋 S&P 500、美國長債、黃金、現金、REITs、CPI
- **Block Bootstrap** — 連續區塊抽樣（block size=4），保留景氣循環序列相關性
- **可重現模擬** — xoshiro128** seeded PRNG，同一 seed 永遠產出相同結果
- **三種提領策略** — 4% 法則、固定金額、動態提領
- **純前端** — 無後端依賴，JSON 靜態打包

## 架構

```
assets_returns.json       ← 歷史報酬資料 ✅
        ↓
Block Bootstrap Engine    ← 重抽樣引擎 ✅
        ↓
Single Path Simulator     ← 單條路徑模擬 ✅
        ↓
Monte Carlo Runner        ← 10,000 路徑 + Web Worker（待開發）
        ↓
Visualization Layer       ← Spaghetti Chart / Percentile Bands（待開發）
        ↓
React UI / Game Loop      ← 完整遊戲迴圈（待開發）
```

## 開發進度

| Phase | 內容 | 狀態 |
|-------|------|------|
| 1 | 資料層（assets_returns.json） | ✅ |
| 2 | 模擬引擎核心（RNG + Bootstrap + Simulator） | ✅ |
| 3 | 批次模擬 + Web Worker | ⬜ |
| 4 | 基礎 UI（滑桿、表單） | ⬜ |
| 5 | 視覺化（Percentile Band + Spaghetti Chart） | ⬜ |
| 6 | 事件系統（隨機事件干預） | ⬜ |
| 7 | 完整遊戲迴圈 | ⬜ |

## 技術棧

- **語言**：TypeScript
- **前端**：React + Zustand
- **圖表**：Recharts + Canvas
- **運算**：Web Worker
- **RNG**：xoshiro128**
- **測試**：Vitest

## 快速開始

```bash
npm install
npm test
```

## 授權

ISC
