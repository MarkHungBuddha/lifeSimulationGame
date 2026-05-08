# Demo Feature Flag Block 與操作流程圖文案調整計畫

## 背景

為了 demo，暫時封鎖以下尚未準備展示或容易分散焦點的進階模組：

- 職業模擬
- 住房規劃
- 移民規劃

封鎖必須是可逆的。後續若要恢復展示，應只需要調整集中式設定，而不是回頭修改多個 UI 或模擬邏輯入口。

## 目標

- Demo 期間使用者不能開啟職業、住房、移民三個模組。
- 即使舊存檔或既有 localStorage 狀態帶有 enabled=true，也不能讓這三個模組進入模擬參數。
- 保留現有業務邏輯與資料，不刪 engine、event、store 型別或資料檔。
- 操作流程圖文案改成 demo 當下可展示的流程，不再引導使用者開啟被封鎖的模組。
- 之後恢復模組時，改動點集中且明確。

## 建議實作方案

### 1. 新增集中式 feature flag

新增檔案：

- `src/config/featureFlags.ts`

建議內容：

```ts
export const FEATURE_FLAGS = {
  occupationPlan: false,
  housingPlan: false,
  immigrationPlan: false,
} as const
```

後續要恢復功能時，將對應 flag 改為 `true`。

### 2. UI 層封鎖

修改 `src/components/Controls.tsx`：

- 職業模擬區塊依 `FEATURE_FLAGS.occupationPlan` 決定是否顯示。
- 住房規劃區塊依 `FEATURE_FLAGS.housingPlan` 決定是否顯示。
- 移民規劃區塊依 `FEATURE_FLAGS.immigrationPlan` 決定是否顯示。

建議 demo 期間採用「直接隱藏整個區塊」，不要只 disable switch。原因是 demo 目標是讓流程乾淨，避免觀眾看到不可用選項後追問尚未展示的細節。

### 3. Store 層防護

修改 `src/store/gameStore.ts`：

- `setOccupationEnabled(true)` 在 flag 關閉時強制維持 `occupationEnabled: false`。
- `setHousingEnabled(true)` 在 flag 關閉時強制維持 `housingEnabled: false`。
- `setImmigrationEnabled(true)` 在 flag 關閉時強制維持 `immigrationEnabled: false`，且不自動打開 `enableEvents`。
- `runSimulation` 建立 `occupationPlan`、`housingPlan`、`immigrationPlan` 時加上 flag 判斷。
- `runStory` 建立同樣三個 plan 時也加上 flag 判斷。

這一層是必要防線，避免 UI 隱藏後仍因舊狀態、舊存檔或手動 state 注入而影響模擬結果。

### 4. Saved records 載入防護

修改 `src/components/SavedRecordsDialog.tsx`：

- 載入舊紀錄時，若 flag 關閉，對應 enabled 欄位必須寫入 `false`。
- 可保留其他設定值，例如 `occupationId`、`housingPurchaseAge`、`immigrationTarget`，方便未來重新開啟 flag 後仍能沿用紀錄中的細節。

建議行為：

- `occupationEnabled: FEATURE_FLAGS.occupationPlan ? record.occupationEnabled : false`
- `housingEnabled: FEATURE_FLAGS.housingPlan ? record.housingEnabled : false`
- `immigrationEnabled: FEATURE_FLAGS.immigrationPlan ? record.immigrationEnabled : false`

### 5. Saved records 顯示策略

目前紀錄列表會顯示住房與移民 chip。demo 期間有兩種做法：

- 保守做法：flag 關閉時不顯示對應 chip，避免使用者以為可以展示。
- 透明做法：顯示 chip 但加上 unavailable 標記。

建議採用保守做法，因為 demo 目標是降低分心。

## 操作流程圖文案調整

目前文案位置：

- `src/i18n/messages.ts`
- `guide.flow.*`
- `guide.mobile.*`
- `guide.desktop.*`

目前問題：

- 操作流程圖的「加入人生模組」會明確提到職業、購屋、移民。
- mobile / desktop 建議步驟也會提示使用者調整 housing、occupation、immigration。
- demo 封鎖後，這些文字會和畫面不一致。

### 建議調整方向

把流程焦點從「加入人生模組」改成「確認風險設定」或「選擇進階設定」。demo 期間只引導使用者使用仍可展示的功能，例如隨機事件、資產配置、提領策略與模擬結果。

### 建議中文文案

- `guide.flow.optional_modules.title.simulation`
  - 原：加入人生模組
  - 建議：確認進階設定

- `guide.flow.optional_modules.body.simulation`
  - 原：依計畫開啟隨機事件、職業、購屋或移民。
  - 建議：依情境確認隨機事件、資產配置與提領設定，讓模擬假設更貼近 demo 目標。

- `guide.flow.optional_modules.title.story`
  - 原：加入人生模組
  - 建議：確認故事設定

- `guide.flow.optional_modules.body.story`
  - 原：開啟隨機事件、職業、購屋或移民，讓故事路徑更完整。
  - 建議：確認隨機事件與財務假設，讓故事路徑能清楚呈現資產變化。

- `guide.mobile.step3.body.simulation`
  - 原：調整資產配置、提領策略、隨機事件、職業、住房或移民。
  - 建議：調整資產配置、提領策略與隨機事件，確認本次 demo 要展示的假設。

- `guide.mobile.step3.body.story`
  - 原：開啟隨機事件、職業、住房或移民，讓時間線包含這些人生變化。
  - 建議：開啟隨機事件並確認財務假設，讓時間線呈現主要資產變化。

- `guide.desktop.step2.body.simulation`
  - 原：檢查年投資、配置總和、提領策略、事件開關、住房、職業與移民設定。
  - 建議：檢查年投資、配置總和、提領策略與事件開關，確認模擬輸入一致。

- `guide.flow.review.body.story`
  - 原：確認是否存活、幾歲破產、事件、資產變化、購屋或移民里程碑。
  - 建議：確認是否存活、幾歲破產、事件與資產變化。

英文與日文文案也應同步移除 occupation、housing、immigration 的引導字眼，避免切換語言後仍出現被封鎖功能。

## 驗收標準

- Demo 畫面不出現職業模擬、住房規劃、移民規劃三個可操作區塊。
- 舊存檔載入後，這三個 enabled 狀態仍為 false。
- 執行 simulation 時，worker request 不包含 `occupationPlan`、`housingPlan`、`immigrationPlan`。
- 執行 story 時，`simulatePath` 參數不包含上述三個 plan。
- 操作流程圖與 mobile / desktop 建議步驟不再引導使用者使用被封鎖功能。
- 將 feature flag 改為 true 後，對應模組可以用既有 UI 與業務邏輯恢復。

## 實作順序

1. 新增 `src/config/featureFlags.ts`。
2. 在 `Controls.tsx` 隱藏三個模組區塊。
3. 在 `gameStore.ts` 加入 setter 與 plan 建立防護。
4. 在 `SavedRecordsDialog.tsx` 防止舊紀錄還原 disabled feature。
5. 調整 `src/i18n/messages.ts` 的流程圖與操作建議文案。
6. 執行 build / test。
7. 手動檢查 simulation 與 story 兩個 view 的 demo 流程。

## 風險與注意事項

- 如果只改 UI，舊存檔仍可能把 disabled feature 帶入模擬，所以 store 層防護不可省略。
- 若選擇完全隱藏區塊，demo 期間不需要新增「即將開放」文案，避免畫面焦點分散。
- 不建議刪除 engine 或 event 相關程式碼，因為後續恢復成本會變高。
- 文案調整要同步三種語言，否則切換語言後會看到不一致的流程提示。
