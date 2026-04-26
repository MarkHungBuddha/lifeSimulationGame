# 移民 / 一般事件財務套用修復計畫

## 目的

修復目前事件系統「故事有顯示，但財務結果未完整反映」的問題，並統一一般事件與移民事件進入 `simulatePath` 的規則。

這份文件是實作規格，不是討論稿。目標是讓後續修改可直接依文件落地，避免再靠臨場解讀。

## 目前已確認的問題

### 1. 移民事件大多只寫進故事，沒有進入財務模擬

目前移民事件會在 `src/engine/immigrationEngine.ts` 產生 `actualImpacts`，但 `src/engine/simulator.ts` 真正套用到模擬的，只有 `income_boost`。

目前未落地到財務結果的移民事件 effect 包含：

- `income_change`
- `portfolio_change`
- `savings_change`
- `extra_expense`
- `savings_boost`

### 2. 一般事件的 `income_change` 只被統計，沒有改變當年收入基礎

目前 `src/events/eventEngine.ts` 會彙總 `totalIncomeImpact`，`src/engine/simulator.ts` 也會把它記進 snapshot，但不會影響：

- 當年 contribution
- 當年 retirement withdrawal base
- 當年 housing affordability 使用的收入基礎
- 後續年度收入狀態

### 3. `permanent` 存在於資料層，但模擬層沒有一致實作

事件型別 `EventImpact` 已有 `permanent?: boolean`，資料庫中也已使用，但模擬邏輯目前主要只靠 `impact.type === 'income_boost'` 判斷永久效果，造成：

- `income_change + permanent: true` 沒有真正跨年
- `savings_boost + permanent: true` 沒有明確語意

### 4. 年度事件套用順序沒有正式定義

目前實作存在隱含順序，但未文件化。這會導致：

- 同一個 effect 被不同人理解成不同時點生效
- 後續新增國家 / 新事件時繼續複製相同 bug

## 這次修復的明確範圍

### 本次一定要解決

- 一般事件與移民事件都走同一套 effect normalization / application 流程
- 所有已存在的 effect type 都必須真正影響模擬結果
- `temporary` 與 `permanent` 行為要有固定規則
- 年度套用時序要固定
- 既有故事輸出不能退化
- 補測試鎖住行為

### 本次明確不做

- 不改 Monte Carlo 主流程與抽樣方法
- 不重做事件機率模型
- 不重設既有 cap 數值
- 不引入月度模擬
- 不讓 `durationMonths` 進入本次財務模型

## 關於 `durationMonths` 的決定

### 本次決策

`durationMonths` 本次仍只作敘事資料使用，不進入財務計算。

### 實作含義

- 所有事件 effect 仍以「年度粒度」處理
- 只要事件在該年觸發，該 effect 就視為對該模擬年度生效
- 不依 `durationMonths` 對 `income_change`、`extra_expense`、`savings_change` 做按月折算
- 不新增「跨多年度自動續效」機制

### 原因

- 目前整個模擬器是年度粒度，若只把 `durationMonths` 局部接進事件模組，會讓 effect 模型與其餘模組粒度不一致
- 這次修復的核心問題是「effect 沒進模型」，不是「事件時長建模不足」
- 先讓 effect 套用語意一致，再考慮之後是否升級為更細粒度模型

### 文件要求

若後續有人要讓 `durationMonths` 進入模型，必須另開 ticket，不得在本修復中順手加入半套月度邏輯。

## effect 語意定義

### 一次性 effect

- `portfolio_change`
  - 一次性資產變動
  - 直接作用於當年 `portfolio`
  - 不延續到下一年

- `savings_change`
  - 這次明確定義為一次性資產變動
  - 視為 portfolio 存量增減，不代表儲蓄率改變
  - 不延續到下一年

- `extra_expense`
  - 當年一次性額外支出
  - 只影響當年 `portfolio`
  - 不延續到下一年

- `income_change`
  - 預設只影響當年收入基礎
  - `permanent !== true` 時，不得改寫跨年收入狀態

- `savings_boost`
  - `permanent !== true` 時，視為一次性資產變動
  - 套用到當年 `portfolio`
  - 不延續到下一年

### 持續性 effect

- `income_boost`
  - 視為永久收入調整
  - 從當年開始生效
  - 會影響當年 income base，也會寫回跨年收入狀態

- `income_change + permanent: true`
  - 視為永久收入調整
  - 行為與 `income_boost` 同級

- `savings_boost + permanent: true`
  - 本次不再模糊解讀為 portfolio 增減
  - 明確定義為「永久支出/可支配儲蓄調整」
  - 實作上不繼續沿用模糊語意，改為顯式 normalization 欄位

## `savings_boost + permanent` 的執行規格

這是本次最容易再次出錯的點，因此不保留彈性。

### 本次固定規則

- 若 `savings_boost` 且 `permanent: true`，在 normalization 階段轉成 `expenseDeltaPermanent`
- 正值代表永久降低支出 / 提高可儲蓄額
- 負值代表永久提高支出 / 降低可儲蓄額

### 實作原因

目前事件資料中的 `savings_boost + permanent: true` 主要語意其實是：

- 育兒支出永久增加
- 房貸月付永久增加
- 稅務 / 制度變化讓可支配儲蓄永久下降

這些語意更接近永久支出調整，不是永久 portfolio 變動。

### 本次不做的事

- 不新增新的公開 event type 到資料庫
- 不強制立刻把所有資料庫 type 名稱改掉

### 但在程式內部必須做到

- 不再把 `savings_boost + permanent: true` 直接計入 `totalPortfolioImpact`
- 必須在 normalization 後落成一個明確的永久調整欄位

## 年度套用時序

本次修復後，年度流程固定如下：

1. 處理移民狀態機本身的 phase 轉換與固定成本
2. 產生一般事件與移民事件
3. 先將兩者輸出整理成共用 normalized event effects
4. 套用一次性資產衝擊
   - `portfolio_change`
   - `savings_change`
   - `savings_boost` 且 `permanent !== true`
5. 套用一次性額外支出
   - `extra_expense`
6. 計算當年收入基礎
   - 套入 temporary income effect
   - 套入 permanent income effect 的當年效果
7. 套用職業加薪
8. 用新的收入 / 支出基礎計算 housing affordability、contribution、withdrawal
9. 套用投資報酬
10. 年末寫回跨年狀態
   - 永久收入調整
   - 永久支出調整

### 核心原則

- temporary 只影響當年
- permanent 同時影響當年與未來
- 任何 effect 不能只進故事，不進模型

## 保留的既有相容規則

### 1. 一般事件 aggregation 規則保留

同一事件內：

- `portfolio_change`
- `savings_change`

共用同一池，只取最大損失與最大收益，不做逐筆無上限累加。

### 2. 年度保護 cap 保留

- 年度事件造成的資產損失上限：當年 `portfolio` 的 `-30%`
- 年度事件造成的 `extra_expense` 上限：`3` 個月收入

### 3. 移民事件也納入同一套 cap

若移民事件進入共用 normalization / application pipeline，就必須共用相同 cap。

本次不保留移民事件的隱性例外。若後續認為某個移民事件必須超過 cap，應以資料設計與測試明確標記，不得默默繞過。

## 可執行實作方案

### Phase 1: 抽出共用 normalization 層

新增共用事件效果彙總層，輸出至少包含以下欄位：

- `portfolioDeltaImmediate`
- `expenseDeltaImmediate`
- `incomeDeltaCurrentYear`
- `incomeDeltaPermanent`
- `expenseDeltaPermanent`

執行要求：

- 一般事件與移民事件都要轉成同一結構
- aggregation 與 cap 在這一層處理
- `actualImpacts` 仍保留給故事顯示
- normalization 的輸出要能獨立測試

### Phase 2: 重構 `simulatePath`

把目前直接在 `simulatePath` 中零散套 effect 的做法改成：

- 先取得 normalized event effects
- 用 normalized 結果更新當年 portfolio / income base / expense base
- 將 `currentYearIncomeBase` 與 `effectiveIncome` 拆開
  - `currentYearIncomeBase`：本年實際計算用
  - `effectiveIncome`：跨年狀態

執行要求：

- temporary income 不得寫回 `effectiveIncome`
- permanent income 必須當年立即生效，並在年末寫回 `effectiveIncome`
- permanent expense 必須影響 contribution / withdrawal，而不是假裝成單年 portfolio 扣減

### Phase 3: 整理 `eventEngine` 與 `immigrationEngine` 輸出責任

責任劃分如下：

- `eventEngine.ts`
  - 負責觸發一般事件
  - 負責產生事件與原始 impact 明細
  - 不再只輸出粗粒度 `totalIncomeImpact` 讓上層自行猜語意

- `immigrationEngine.ts`
  - 負責觸發移民 phase 與移民事件
  - 回傳事件本身與移民固定成本 / 倍率資訊
  - 不再由 `simulatePath` 只挑 `income_boost` 特判

- 共用 normalization 層
  - 接收一般事件與移民事件
  - 做 effect 分類、temporary/permanent 判定、cap 與 aggregation

### Phase 4: 補測試並鎖定行為

至少新增以下測試：

- 移民事件 `income_change` 會影響當年 contribution
- 移民事件 `income_change` 在 `permanent !== true` 時不影響下一年基礎收入
- 一般事件 `income_change` 會影響當年 income base
- `income_change + permanent: true` 會從當年開始跨年延續
- `income_boost` 會從當年開始跨年延續
- `extra_expense` 會降低當年 portfolio
- `savings_boost + permanent: true` 會改變後續 contribution / withdrawal 基礎，而不是只改單年 portfolio
- 一次性 effect 不會錯誤延續
- 一般事件 aggregation 規則仍成立
- 共同 cap 規則仍成立
- 同 seed 可重現
- 未啟用事件時既有結果不變

## 需要修改的檔案

本次最小必要變更檔案：

- `src/engine/simulator.ts`
- `src/engine/immigrationEngine.ts`
- `src/events/eventEngine.ts`
- `src/events/eventTypes.ts`
- `tests/engine.test.ts`

大概率會新增一個共用 normalization 模組，建議位置：

- `src/events/eventEffects.ts`

### 本次預設不改資料庫

以下檔案先不作資料型別重命名，只在程式內部重新解讀：

- `src/events/eventDatabase.ts`
- `src/events/eventDatabase_tw.ts`
- `src/events/eventDatabase_jp.ts`
- `src/engine/immigrationData.ts`

只有在實作時發現資料無法被一致解讀，才補第二階段資料清理。

## 驗收標準

以下條件全部成立，才算這次修復完成：

1. 移民事件與一般事件都不再存在「有顯示、沒入模擬」的 effect
2. `temporary` / `permanent` 在程式與測試中的行為一致
3. `savings_boost + permanent: true` 不再被當作一次性 portfolio effect
4. 事件時序在文件與程式實作一致
5. 未啟用事件時，不造成既有結果回歸
6. 同 seed 結果可重現
7. 所有新增測試通過

## 風險與預期影響

- 修復後成功率、失敗率、破產率改變是預期行為，不視為回歸
- 因為 `income_change` 與移民事件真正開始進模型，部分場景結果可能明顯變差
- 若資料層存在語意不一致事件，會在 normalization 實作時被暴露出來，這是好事，不應用特判掩蓋

## 實作順序

1. 先新增 normalization 資料結構與單元測試
2. 再改 `simulatePath` 套用順序與跨年狀態
3. 接著調整 `eventEngine` / `immigrationEngine` 輸出責任
4. 最後補齊回歸測試並確認 story output 未退化

## 非目標提醒

這次修復不回答以下問題：

- 事件機率是否過高或過低
- `durationMonths` 是否應折算
- 是否應改成月度模擬
- 各國資料是否需要重新平衡

這些都應在本修復完成後另外處理，不應混進這次變更。
