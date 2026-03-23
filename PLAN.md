# 蒙地卡羅人生模擬遊戲 — 開發計畫

## 專案狀態：Phase 1 資料層完成

---

## 已完成

### ✅ 設計藍圖確立
- 核心玩法迴圈（初始設定 → 策略擬定 → 模擬檢視 → 動態事件）
- 五大系統模組定義完成
- 技術架構選型完成

### ✅ 資料策略決定
- **選用路線 B：歷史序列重抽樣（Block Bootstrap）**
  - 不用常態分佈假設，從真實歷史年份聯合抽樣
  - 保留資產間相關性（股災時黃金上漲等真實關係）
  - 保留肥尾分佈，比常態分佈更接近現實
- 統一起點：1972 年（五個資產類別最短公分母）
- 資料全部靜態打包，不依賴外部 API

### ✅ 資料整合完成（`assets_returns.json`）
- 覆蓋 1972–2023，共 52 年
- 五個資產類別：sp500、bond、gold、cash、reits
- 含通膨（cpi）欄位，可計算實質報酬
- 重大事件年份驗證通過（2008 股票 -37% / 公債 +26% 等邏輯正確）

---

## 待開發任務

### Phase 2：模擬引擎核心
**目標：一條路徑能正確跑完 50 年**

- [ ] 實作 Seeded RNG（推薦 xoshiro128）
- [ ] 實作 Block Bootstrap（block size = 4）
- [ ] 單條路徑模擬
  - 每年：抽歷史年份 → 計算加權報酬 → 扣提領金額 → 扣通膨
  - 檢查破產條件（資產 ≤ 0）
  - 輸出每年資產值陣列
- [ ] 驗證：相同 seed 產出相同結果

**關鍵決策點**
- 提領金額是否通膨調整？（建議：是，採 4% 法則實質提領）
- 資產配置再平衡頻率？（建議：每年自動再平衡）

---

### Phase 3：批次模擬 + Web Worker
**目標：10,000 條路徑，UI 不凍結**

- [ ] 將模擬引擎移入 Web Worker
- [ ] 主執行緒 ↔ Worker 通訊介面設計
- [ ] 批次執行 10,000 條路徑
- [ ] 計算 Percentile（p10/p25/p50/p75/p90）
- [ ] 計算成功率（50 年內未破產比率）
- [ ] 輸出格式：`Float32Array` 記憶體優化

---

### Phase 4：基礎 UI
**目標：可以操作滑桿看到結果數字**

- [ ] 初始設定表單（年齡、退休年齡、起始資金）
- [ ] 資產配置滑桿（5 個資產，總和鎖定 100%）
- [ ] 提領策略選擇（4% 固定 / 動態 / 自訂金額）
- [ ] 「執行模擬」按鈕 → 顯示成功率大數字
- [ ] Loading 狀態（Web Worker 執行中）

---

### Phase 5：視覺化
**目標：Percentile Band 圖表**

- [ ] Percentile Band Chart（recharts filled area）
  - X 軸：年份（0–50）
  - Y 軸：資產值
  - 帶狀：p10–p90 填充，p50 主線
- [ ] Spaghetti Chart（Canvas，抽樣 200 條路徑）
  - 存活路徑：藍色，opacity 0.15
  - 破產路徑：紅色，opacity 0.2
- [ ] 成功率 Gauge / 大字顯示
- [ ] 切換：Percentile / Spaghetti 兩種視角

---

### Phase 6：事件系統
**目標：時間推進 + 隨機事件干預**

- [ ] 事件資料庫定義（市場崩盤、醫療支出、職涯中斷、通膨飆升）
- [ ] 每年事件擲骰子邏輯
- [ ] 事件觸發後強制插入當年模擬
- [ ] 玩家事件決策介面（彈出視窗 → 調整配置）
- [ ] 遊戲時間軸推進 UI

---

### Phase 7：完整遊戲迴圈
**目標：從設定到結局的完整體驗**

- [ ] 遊戲狀態機（設定 → 模擬中 → 推進 → 事件 → 結局）
- [ ] 結局畫面（財務自由 / 破產年份 / 勉強存活）
- [ ] 歷史紀錄（本次模擬的 seed，可重播）
- [ ] 不同策略比較（A/B 對照模擬）

---

## 技術決策紀錄

| 決策 | 選擇 | 理由 |
|-----|------|------|
| 資料策略 | Block Bootstrap | 保留真實相關性與肥尾 |
| 歷史起點 | 1972 | 五資產最短公分母 |
| 模擬路徑數 | 10,000 | 收斂足夠，1–3 秒可接受 |
| 運算方式 | Web Worker | 避免 UI 凍結 |
| RNG | xoshiro128 | 可 seed、比 Math.random 快 |
| Bootstrap block size | 4 年 | 平衡序列相關性與樣本多樣性 |
| 圖表庫 | recharts + Canvas | Percentile 用 recharts，Spaghetti 用 Canvas |
| 狀態管理 | Zustand | 輕量，適合滑桿即時更新 |
| 後端 | 無 | 純前端，JSON 靜態打包 |

---

## 已知風險與挑戰

| 風險 | 影響 | 對策 |
|-----|------|------|
| 52 年資料抽 50 年模擬，樣本數偏小 | 模擬多樣性不足 | Block Bootstrap 部分緩解；未來可加入 Parametric 補充 |
| Canvas Spaghetti 10,000 條效能 | UI 卡頓 | 只渲染抽樣 200 條，其餘只算 Percentile |
| 事件系統讓每次模擬路徑長度不一致 | 統計計算複雜 | 事件只影響當年參數，路徑長度固定為 50 年 |
| 黃金資料 1968 前無歷史 | 資料缺口 | 已鎖定 1972 起點解決 |

---

## 檔案結構（目標）

```
monte-carlo-game/
├── SKILL.md
├── PLAN.md
├── data/
│   └── assets_returns.json     ✅
├── src/
│   ├── engine/
│   │   ├── rng.ts               ← Phase 2
│   │   ├── bootstrap.ts         ← Phase 2
│   │   ├── simulator.ts         ← Phase 2
│   │   └── worker.ts            ← Phase 3
│   ├── events/
│   │   └── events.ts            ← Phase 6
│   ├── components/
│   │   ├── Controls.tsx         ← Phase 4
│   │   ├── PercentileChart.tsx  ← Phase 5
│   │   ├── SpaghettiChart.tsx   ← Phase 5
│   │   └── GameLoop.tsx         ← Phase 7
│   └── store/
│       └── gameStore.ts         ← Phase 4
└── public/
    └── assets_returns.json
```
