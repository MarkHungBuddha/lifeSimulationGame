# 移民事件 Bug 修復計畫

## 背景

目前移民模組與一般事件系統在資料層已定義多種財務影響類型，但 `simulatePath` 真正套用到年度現金流與資產的只有部分效果，導致人生故事能看到事件，模擬結果卻沒有完整反映事件成本與收入變動。

## 已確認問題

### 1. 移民專屬事件多數只被記錄，沒有落到財務結果

- `income_change`
- `portfolio_change`
- `savings_change`
- `extra_expense`
- `savings_boost`

目前在移民路徑中，實際只有 `income_boost` 會改動 `effectiveIncome`。

### 2. 一般事件的 `income_change` 只有統計值，沒有改變後續收入

- `eventEngine.ts` 會計算 `totalIncomeImpact`
- `simulatePath` 會把它存進 `eventIncomeImpact`
- 但不會把 `income_change` 真正反映到工作期收入或退休前存入能力

### 3. `permanent` 標記沒有被一致使用

- 事件資料中已有 `permanent: true`
- 但目前模擬邏輯主要靠 `impact.type === 'income_boost'` 判斷是否持久生效
- 導致 `income_change` / `savings_boost` 等帶 `permanent` 的設計語意沒有真正實作

## 修復目標

1. 讓移民專屬事件和一般事件都透過同一套財務套用規則進入模擬結果
2. 區分一次性影響與持續性影響
3. 保持既有故事模式輸出不退化
4. 補上測試，避免之後再出現「事件有顯示、結果沒反映」的回歸

## 建議修復方向

### Phase 1: 統一事件財務套用模型

- 新增事件效果彙總層，明確分出：
  - 一次性資產變動
  - 當年額外支出
  - 當年收入變動
  - 永久收入倍率/增量
  - 永久儲蓄或支出調整
- 讓一般事件與移民事件共用同一套 effect normalization 流程

### Phase 2: 調整 `simulatePath` 年度流程

- 在年度事件結算後，先套用：
  - 當年 portfolio 變化
  - 當年 expense 變化
  - 當年 income 變化
- 再更新：
  - 長期 `effectiveIncome`
  - 後續 contribution / withdrawal 計算基礎
- 避免移民事件與一般事件各自有半套規則

### Phase 3: 明確定義 `permanent`

- 對 `income_change` + `permanent: true`：
  - 轉為持續性收入調整
- 對 `income_boost`：
  - 保持永久收入增量語意
- 對 `savings_boost` + `permanent: true`：
  - 重新定義為永久支出/儲蓄率修正，或在型別上拆成更清楚的 effect type

## 需要修改的檔案

- `src/engine/simulator.ts`
- `src/engine/immigrationEngine.ts`
- `src/events/eventEngine.ts`
- `src/events/eventTypes.ts`
- `tests/engine.test.ts`

## 測試計畫

### 單元測試

- 移民事件 `income_change` 會降低當年 contribution
- 移民事件 `extra_expense` 會降低當年 portfolio
- 一般事件 `income_change` 會影響後續收入或當年收入基礎
- `permanent: true` 的收入事件會跨年延續
- 一次性事件不會錯誤延續到下一年

### 回歸測試

- 未啟用移民模組時，既有模擬結果維持一致
- 未啟用事件時，既有模擬結果維持一致
- 同 seed 下結果可重現

## 風險

- 修復後成功率與破產率會顯著改變，屬於預期的行為修正
- 現有部分事件資料的 `permanent` 語意不夠一致，可能需要補資料清理
- 若不先統一 effect model，後續再加新國家時會持續複製 bug

## 建議實作順序

1. 先抽出共用事件 effect normalization
2. 再改 `simulatePath` 的年度事件套用順序
3. 補測試鎖住行為
4. 最後再清理事件資料中的 `permanent` 語意
