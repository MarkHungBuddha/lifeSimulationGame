# 移民事件 Bug 修復計畫

## 背景

目前移民模組與一般事件系統在資料層已定義多種財務影響類型，但 `simulatePath` 真正套用到年度現金流與資產的只有部分效果，導致人生故事能看到事件，模擬結果卻沒有完整反映事件成本與收入變動。

現況有兩套不一致的行為：

- 一般事件會先在 `eventEngine.ts` 彙總成 `totalPortfolioImpact` / `totalIncomeImpact` / `totalExpense`
- 移民事件只產生 `actualImpacts` 供故事顯示，實際上只有 `income_boost` 會寫回 `effectiveIncome`

因此這次修復不只是補幾個漏掉的 effect，而是要先把「事件影響如何進入年度模擬」定義清楚，再統一實作。

## 已確認問題

### 1. 移民專屬事件多數只被記錄，沒有落到財務結果

下列 effect 目前在移民事件中只會出現在 `actualImpacts`，不會真正影響當年資產或現金流：

- `income_change`
- `portfolio_change`
- `savings_change`
- `extra_expense`
- `savings_boost`

目前在移民路徑中，實際只有 `income_boost` 會改動 `effectiveIncome`。

### 2. 一般事件的 `income_change` 只有統計值，沒有反映到年度收入基礎

- `eventEngine.ts` 會計算 `totalIncomeImpact`
- `simulatePath` 會把它存進 `eventIncomeImpact`
- 但不會把 `income_change` 真正反映到當年 contribution、withdrawal 基礎，或後續收入

### 3. `permanent` 標記沒有被一致使用

- 事件資料中已有 `permanent: true`
- 但目前模擬邏輯主要靠 `impact.type === 'income_boost'` 判斷是否持久生效
- 導致 `income_change` / `savings_boost` 等帶 `permanent` 的設計語意沒有真正實作

### 4. 年度事件時序未被明確定義

目前 `simulatePath` 內部的實際順序是：

1. 移民成本
2. 一般事件資產衝擊
3. 永久收入變更
4. 職業加薪
5. 購屋模組
6. contribution / withdrawal
7. 投資報酬
8. 一般事件額外支出

這個順序不是錯，但文件從未明講。若直接修 effect，而不先定義它們落在哪個時點，之後很容易出現：

- 同一個 `income_change` 被人理解成只影響當年
- 或被另一個實作者理解成永久改寫薪資
- 或 `extra_expense` 有人想在報酬前扣，有人想在報酬後扣

## 修復目標

1. 讓移民專屬事件和一般事件都透過同一套財務套用規則進入模擬結果
2. 明確區分一次性影響與持續性影響
3. 明確定義事件發生在年度中的哪個時點
4. 保持既有故事模式輸出不退化
5. 補上測試，避免之後再出現「事件有顯示、結果沒反映」的回歸

## 明確規格

### A. effect 語意定義

- `portfolio_change`
  - 一次性資產變動
  - 直接作用於當年 `portfolio`
  - 不延續到下一年

- `savings_change`
  - 一次性資產變動
  - 這個型別沿用現有資料語意，視為「一次性存量損失/增加」
  - 不解讀為儲蓄率改變
  - 不延續到下一年

- `extra_expense`
  - 當年一次性額外支出
  - 只影響當年 `portfolio`
  - 不延續到下一年

- `income_change`
  - 預設為當年收入調整
  - `permanent !== true` 時，只影響當年收入基礎，不改寫未來年度 `effectiveIncome`
  - `permanent === true` 時，轉為持續性收入調整，從當年起寫回後續年度收入基礎

- `income_boost`
  - 保持既有「永久收入調整」語意
  - 視為 `permanent` 的特化型別
  - 後續可考慮資料清理後併入 `income_change + permanent: true`，但本次不強制做資料遷移

- `savings_boost`
  - `permanent !== true` 時，維持現況，視為一次性資產變動
  - `permanent === true` 時，不再模糊解讀為 portfolio 增減
  - 本次先明確重新定義為「持續性可支配儲蓄調整」
  - 實作上可落成永久 `contributionAdjustment` 或永久 `expenseAdjustment`
  - 若現有資料無法一致對應，允許在型別上拆成更清楚的 effect type

### B. 永久與一次性的判準

- 只有下列情況可改寫跨年狀態：
  - `income_boost`
  - `income_change` 且 `permanent: true`
  - `savings_boost` 且 `permanent: true`

- 下列 effect 一律只影響當年，不得延續：
  - `portfolio_change`
  - `savings_change`
  - `extra_expense`
  - `income_change` 且 `permanent !== true`
  - `savings_boost` 且 `permanent !== true`

### C. 與現有一般事件 aggregation 的相容規則

一般事件目前有兩個既有規則，本次修復必須明確保留，除非另外開 ticket 討論平衡調整：

1. `portfolio_change` 與 `savings_change` 在同一事件內共用同一池
   - 只取最大損失與最大收益
   - 不做逐筆無上限累加

2. 年度保護上限維持不變
   - 年度事件造成的資產損失上限為當年 `portfolio` 的 `-30%`
   - 年度事件造成的 `extra_expense` 上限為 `3` 個月收入

移民事件是否也要套用同樣 cap，這次先採用以下原則：

- 若移民事件在實作上走共用 normalization + application pipeline，則應共用同一套 cap
- 若發現移民事件資料設計上故意需要超過 cap，必須在文件與測試中明列例外，不可默默繞過

### D. 年度時序定義

本次修復後，事件 effect 應依下列時序進入年度模擬：

1. 先處理移民狀態機本身的固定成本與 phase 轉換
2. 產生一般事件與移民事件，先做 effect normalization
3. 套用當年一次性資產衝擊
   - `portfolio_change`
   - `savings_change`
   - 非永久 `savings_boost`
4. 套用當年一次性額外支出
   - `extra_expense`
5. 計算當年收入基礎調整
   - 非永久 `income_change` 只影響本年度 income base
   - 永久收入 effect 也從當年開始生效
6. 再套用職業加薪
   - 讓事件先改變收入基礎，再吃加薪率
7. 依新的 income / expense 基礎計算 housing affordability、contribution、withdrawal
8. 最後才寫回跨年狀態
   - 永久收入調整
   - 永久儲蓄/支出調整

這裡的核心原則是：

- temporary effect 先影響「當年」
- permanent effect 既影響「當年」，也影響「之後」
- 不允許只影響故事顯示、卻不進模型

## 建議修復方向

### Phase 1: 抽出共用事件 effect normalization

- 新增事件效果彙總層，輸出明確欄位，例如：
  - `portfolioDeltaImmediate`
  - `expenseDeltaImmediate`
  - `incomeDeltaCurrentYear`
  - `incomeDeltaPermanent`
  - `contributionDeltaPermanent` 或 `expenseDeltaPermanent`
- 讓一般事件與移民事件共用同一套 normalization 流程
- 保留既有 aggregation 與 cap 規則

### Phase 2: 調整 `simulatePath` 年度流程

- 在年度事件結算後，先套用當年 effect，再計算 contribution / withdrawal
- 將「當年收入基礎」與「跨年有效收入」分成兩個概念，避免把 temporary income 誤寫成永久薪資
- 將「持續性儲蓄/支出調整」明確掛到 state，而不是偷算進單年 portfolio

### Phase 3: 明確定義並清理 `permanent`

- 對 `income_change + permanent: true`
  - 明確落成永久收入調整
- 對 `income_boost`
  - 保持相容，但在程式內與文件中視為永久收入 effect
- 對 `savings_boost + permanent: true`
  - 視情況拆型別，避免事件資料同名不同義

## 需要修改的檔案

- `src/engine/simulator.ts`
- `src/engine/immigrationEngine.ts`
- `src/events/eventEngine.ts`
- `src/events/eventTypes.ts`
- `tests/engine.test.ts`

若決定拆分 `savings_boost` 語意，還需要修改：

- `src/events/eventDatabase.ts`
- `src/events/eventDatabase_tw.ts`
- `src/events/eventDatabase_jp.ts`
- `src/engine/immigrationData.ts`

## 測試計畫

### 單元測試

- 移民事件 `income_change` 會降低當年 contribution，但不會在 `permanent !== true` 時改寫下一年基礎薪資
- 移民事件 `extra_expense` 會降低當年 portfolio
- 一般事件 `income_change` 會影響當年 income base
- `income_change + permanent: true` 會跨年延續
- `income_boost` 會跨年延續且當年立即生效
- 一次性事件不會錯誤延續到下一年
- 一般事件既有 aggregation 規則仍成立
- 事件 cap 仍成立

### 回歸測試

- 未啟用移民模組時，既有模擬結果維持一致
- 未啟用事件時，既有模擬結果維持一致
- 同 seed 下結果可重現
- 事件仍會正確出現在故事模式與快照中

## 風險

- 修復後成功率與破產率會顯著改變，屬於預期的行為修正
- 現有部分事件資料的 `permanent` 語意不夠一致，可能需要補資料清理
- 若 `savings_boost` 不拆語意，後續維護成本仍會偏高
- 若不先統一 effect model，後續再加新國家時會持續複製 bug

## 建議實作順序

1. 先抽出共用事件 effect normalization 與明確型別
2. 再改 `simulatePath` 的年度事件套用順序
3. 補測試鎖住 temporary / permanent / cap / aggregation 行為
4. 最後再清理事件資料中的 `permanent` 與 `savings_boost` 語意
