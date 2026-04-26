# 蒙地卡羅人生模擬遊戲 — 開發計畫

## 專案狀態：v0.9 — 職業系統整合完成

---

## 已完成

### ✅ Phase 1：設計藍圖 + 資料層
- 核心玩法迴圈（初始設定 → 策略擬定 → 模擬檢視 → 動態事件）
- 五大系統模組定義完成
- 技術架構選型完成
- **選用路線 B：歷史序列重抽樣（Block Bootstrap）**
  - 不用常態分佈假設，從真實歷史年份聯合抽樣
  - 保留資產間相關性（股災時黃金上漲等真實關係）
  - 保留肥尾分佈，比常態分佈更接近現實
- 資料整合完成（`data/assets_returns.json`）
  - 覆蓋 1972–2023，共 52 年
  - 五個資產類別：sp500、bond、gold、cash、reits + cpi
  - 重大事件年份驗證通過

### ✅ Phase 2：模擬引擎核心
- xoshiro128** Seeded RNG（`src/engine/rng.ts`）
- Block Bootstrap 重抽樣（`src/engine/bootstrap.ts`，block size = 4）
- 單條路徑模擬器（`src/engine/simulator.ts`）
  - 每年：抽歷史年份 → 加權報酬 → 通膨調整提領 → 破產檢查
  - 三種提領策略：4% 法則 / 固定金額 / 動態提領
  - 驗證：相同 seed 產出相同結果 ✅
- 24 個測試全數通過（`tests/engine.test.ts`，含職業系統 8 個）

### ✅ Phase 3：批次模擬 + Web Worker
- Monte Carlo Runner（`src/engine/runner.ts`）
  - 批次執行 10,000 條路徑
  - 計算 Percentile（p10/p25/p50/p75/p90）
  - 計算成功率（未破產比率）
  - 中位最終資產 / 中位破產年齡
- Web Worker（`src/engine/worker.ts`）
  - 背景執行，UI 不凍結
  - 進度回呼（每 500 條路徑）
  - 只回傳統計結果，節省記憶體

### ✅ Phase 4：基礎 UI（Material Design）
- MUI v7 + Noto Sans TC 字型（`src/main.tsx`）
- 響應式 AppBar + Drawer 佈局（`src/App.tsx`）
- 控制面板（`src/components/Controls.tsx`）
  - 年齡 / 資產 / 存款 Slider
  - 資產配置滑桿（5 個資產，獨立色彩，總和驗證）
  - 提領策略 Select
  - 模擬路徑數 Slider
  - 執行按鈕 + LinearProgress 進度條
- 結果面板（`src/components/ResultPanel.tsx`）
  - 成功率 Hero（顏色語義：綠 ≥80% / 黃 ≥50% / 紅）
  - 統計卡片 Grid（中位最終資產、破產年齡、P90/P10）
  - Percentile 表格（每 5 年，退休年齡高亮）
- Zustand 狀態管理（`src/store/gameStore.ts`）

### ✅ Phase 5：視覺化（部分）
- Percentile Band Chart（Canvas，HiDPI）
  - P10–P90 淺色帶、P25–P75 深色帶、P50 實線
  - 退休年齡虛線標記
  - 網格線 + Y 軸金額標籤

### ✅ v0.9：職業系統
- 10 大職業分類 × 3 國薪資資料（`occupationData.ts`）
- 年度加薪引擎（`occupationEngine.ts`）— 年齡遞減修正
- simulator.ts 整合 — 獨立 RNG seed，事件後加薪
- 職業專屬事件 — 台灣 33 個、美國 34 個、日本 34 個
- 事件引擎職業篩選（`occupationIds` 欄位）
- Zustand Store 擴充 — 職業開關、自動填入收入
- Controls.tsx UI — Switch + 下拉選單 + 職業資訊卡
- StoryPanel 整合 — 職業摘要 + 年度薪資顯示
- 24 個測試全數通過（原 16 + 新增 8）

---

## 待開發任務

### Phase 6：事件系統
**目標：時間推進 + 隨機事件干預**

- [ ] 事件資料庫定義（市場崩盤、醫療支出、職涯中斷、通膨飆升）
- [ ] 每年事件擲骰子邏輯
- [ ] 事件觸發後強制插入當年模擬
- [ ] 玩家事件決策介面（MUI Dialog → 調整配置）
- [ ] 遊戲時間軸推進 UI

---

### Phase 5b：Spaghetti Chart
**目標：個別路徑視覺化**

- [ ] Spaghetti Chart（Canvas，抽樣 200 條路徑）
  - 存活路徑：藍色，opacity 0.15
  - 破產路徑：紅色，opacity 0.2
- [ ] Percentile / Spaghetti 切換 Tab

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
| RNG | xoshiro128** | 可 seed、快、週期長 |
| Bootstrap block size | 4 年 | 平衡序列相關性與樣本多樣性 |
| 圖表 | Canvas API | HiDPI 支援，大量路徑效能好 |
| UI 框架 | MUI v7 | Material Design，響應式 |
| 狀態管理 | Zustand | 輕量，適合滑桿即時更新 |
| 建構工具 | Vite 8 | 快速 HMR，原生 ES module |
| 後端 | 無 | 純前端，JSON 靜態打包 |

---

## 已知風險與挑戰

| 風險 | 影響 | 對策 |
|-----|------|------|
| 52 年資料抽 50 年模擬，樣本數偏小 | 模擬多樣性不足 | Block Bootstrap 部分緩解；未來可加入 Parametric 補充 |
| Canvas Spaghetti 10,000 條效能 | UI 卡頓 | 只渲染抽樣 200 條，其餘只算 Percentile |
| 事件系統讓每次模擬路徑長度不一致 | 統計計算複雜 | 事件只影響當年參數，路徑長度固定 |
| 黃金資料 1968 前無歷史 | 資料缺口 | 已鎖定 1972 起點解決 |

---

## 檔案結構（目前）

```
lifeSimulationGame/
├── SKILL.md                          ✅
├── PLAN.md                           ✅
├── README.md                         ✅
├── index.html                        ✅
├── package.json                      ✅
├── tsconfig.json                     ✅
├── vite.config.ts                    ✅
├── data/
│   └── assets_returns.json           ✅
├── src/
│   ├── main.tsx                      ✅ MUI Theme + 進入點
│   ├── App.tsx                       ✅ AppBar + Drawer 佈局
│   ├── engine/
│   │   ├── index.ts                  ✅ 統一匯出
│   │   ├── rng.ts                    ✅ xoshiro128** PRNG
│   │   ├── bootstrap.ts             ✅ Block Bootstrap
│   │   ├── simulator.ts             ✅ 單條路徑模擬（含職業加薪）
│   │   ├── runner.ts                ✅ 批次 Monte Carlo
│   │   ├── worker.ts                ✅ Web Worker
│   │   ├── occupationTypes.ts       ✅ 職業型別定義
│   │   ├── occupationData.ts        ✅ 10 職業 × 3 國靜態資料
│   │   └── occupationEngine.ts      ✅ 職業引擎（加薪計算）
│   ├── components/
│   │   ├── Controls.tsx             ✅ MUI 控制面板
│   │   └── ResultPanel.tsx          ✅ MUI 結果 + Canvas 圖表
│   ├── store/
│   │   └── gameStore.ts             ✅ Zustand
│   └── events/
│       └── events.ts                ← Phase 6
└── tests/
    └── engine.test.ts               ✅ 16 tests passed
```
