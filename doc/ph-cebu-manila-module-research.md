# 菲律賓模組調查：Cebu 與 Manila

## 目的

為專案新增兩個城市模組：

- `ph-manila`
- `ph-cebu`

本文件整理目前能支撐 MVP 的資料、建議初始參數，以及仍待補的官方城市級缺口。

## 建議實作策略

先把兩地當成同一國家 `PHP` 貨幣體系下的兩個城市版本，而不是先做整個菲律賓國家版。

原因：

- 生活成本、租金、房價差異在 Manila 與 Cebu 間已足夠大
- 可以沿用現有 `region` 模式，直接做城市級 preset
- 事件系統可以共用「菲律賓事件池」，再加上城市權重差異

## 核心資料總表

| 項目 | Manila | Cebu | 用途 | 來源 |
|---|---:|---:|---|---|
| 貨幣 | PHP / `₱` | PHP / `₱` | `regions.ts` | 共通設定 |
| 非農日薪最低工資 | ₱695/日 | ₱540/日 | slider 下限、低收入 preset | NCR wage order（2025-07-18 生效）、Central Visayas wage order（2025-09-11 核准） |
| 平均家庭年收入 | NCR：₱513.52k（2023） | 官方城市級未直接找到；可先用次級薪資資料 + Central Visayas區域資料補位 | lifestyle preset 校準 | PSA FIES 2023 |
| 平均家庭年支出 | NCR：₱385.05k（2023） | Central Visayas：₱218.03k（2023） | lifestyle preset 校準 | PSA FIES 2023 |
| 記帳/簿記職平均月薪 | NCR：₱24,530（2022） | Region VII：₱18,989（2022） | 職業模組初始薪資 proxy | PSA OWS 2022 |
| 社群回報月淨薪 | ₱27,228/月 | ₱22,884/月 | 城市差異校準 | Numbeo（2026-04） |
| 市中心 1BR 月租 | ₱33,970 | ₱31,792 | 租屋支出 / 生活成本 | Numbeo（2026-04） |
| 郊區 1BR 月租 | ₱16,131 | ₱19,050 | 租屋支出 / 生活成本 | Numbeo（2026-04） |
| 市中心購屋單價 | ₱266,125/㎡ | ₱183,000/㎡ | 購屋模組房價基準 | Numbeo（2026-04） |
| 郊區購屋單價 | ₱158,833/㎡ | ₱119,000/㎡ | 購屋模組房價基準 | Numbeo（2026-04） |
| 20 年房貸利率 | 7.4% | 7.0% | 購屋模組利率初值 | Numbeo（2026-04） |
| 住宅價格年增 | NCR：+13.9% YoY（Q1 2025） | Metro Cebu：-1.7% YoY（Q1 2025） | 房價漲跌均值參考 | BSP RPPI Q1 2025 |

## 可直接落地的模組建議

### 1. 地區設定

建議新增兩個 region id：

```ts
type Region = 'us' | 'tw' | 'jp' | 'ph-manila' | 'ph-cebu'
```

共同設定：

- `currency = PHP`
- `currencySymbol = ₱`
- `intlStock` 標籤可用「海外股票」

建議資產標籤：

- `sp500`: 菲律賓股票 / PSEi
- `intlStock`: 海外股票
- `bond`: 菲律賓公債
- `gold`: 黃金
- `cash`: 現金(PHP)
- `reits`: Philippine REITs

### 2. 收入與生活風格 preset

#### Manila 建議

官方與次級資料顯示 Manila / NCR 明顯高於 Cebu：

- NCR 2023 平均家庭年收入：`₱513,520`
- NCR 2023 平均家庭年支出：`₱385,050`
- NCR 2022 benchmark clerical wage：`₱24,530/月`
- Manila Numbeo 月淨薪：`₱27,228/月`

建議 MVP 生活風格：

| 風格 | 年收入 | 年支出 | 年投資 |
|---|---:|---:|---:|
| frugal | ₱300k | ₱180k | ₱60k |
| moderate | ₱540k | ₱360k | ₱100k |
| comfortable | ₱900k | ₱600k | ₱180k |
| luxury | ₱1.6M | ₱1.1M | ₱220k |
| lean_fire | ₱650k | ₱300k | ₱220k |
| fat_fire | ₱2.4M | ₱1.2M | ₱700k |

#### Cebu 建議

目前找到的官方城市級收入不如 Manila 完整，因此建議用：

- Central Visayas 2023 平均家庭年支出：`₱218,030`
- Region VII 2022 benchmark clerical wage：`₱18,989/月`
- Cebu Numbeo 月淨薪：`₱22,884/月`

作為第一版校準。

建議 MVP 生活風格：

| 風格 | 年收入 | 年支出 | 年投資 |
|---|---:|---:|---:|
| frugal | ₱240k | ₱150k | ₱45k |
| moderate | ₱420k | ₱240k | ₱80k |
| comfortable | ₱720k | ₱420k | ₱150k |
| luxury | ₱1.2M | ₱800k | ₱180k |
| lean_fire | ₱500k | ₱220k | ₱160k |
| fat_fire | ₱1.8M | ₱900k | ₱500k |

### 3. 滑桿範圍建議

#### Manila

```ts
annualIncome:       180_000 - 4_000_000
annualExpense:      120_000 - 2_500_000
annualContribution: 0 - 2_000_000
initialPortfolio:   0 - 80_000_000
withdrawalAmount:   120_000 - 2_500_000
withdrawalFloor:    100_000 - 1_800_000
withdrawalCeiling:  180_000 - 3_500_000
```

#### Cebu

```ts
annualIncome:       150_000 - 3_000_000
annualExpense:      100_000 - 2_000_000
annualContribution: 0 - 1_500_000
initialPortfolio:   0 - 60_000_000
withdrawalAmount:   100_000 - 2_000_000
withdrawalFloor:    80_000 - 1_400_000
withdrawalCeiling:  150_000 - 2_800_000
```

## 購屋模組建議

### 可用資料

官方房價「水位」資料不足，但已找到兩種可用來源：

1. 官方趨勢：
   - NCR RPPI 在 `2025 Q1` 年增 `13.9%`
   - Metro Cebu RPPI 在 `2025 Q1` 年增 `-1.7%`
2. 城市級市場水位：
   - Manila 市中心購屋單價 `₱266,125/㎡`
   - Cebu 市中心購屋單價 `₱183,000/㎡`

### 初始參數建議

#### Manila

- `mortgageRate`: `0.074`
- `defaultPriceToIncomeRatio`: `9`
- `closingCostRatio`: `0.06`
- `annualHoldingCostRatio`: `0.015`
- `appreciationMean`: `0.05`
- `appreciationStd`: `0.09`
- `rentToValueRatio`: `0.055`
- `defaultDownPaymentRatio`: `0.20`
- `defaultMortgageYears`: `20`

#### Cebu

- `mortgageRate`: `0.070`
- `defaultPriceToIncomeRatio`: `7`
- `closingCostRatio`: `0.06`
- `annualHoldingCostRatio`: `0.013`
- `appreciationMean`: `0.025`
- `appreciationStd`: `0.08`
- `rentToValueRatio`: `0.050`
- `defaultDownPaymentRatio`: `0.20`
- `defaultMortgageYears`: `20`

### 房貸制度備註

官方 Pag-IBIG 資料顯示：

- 社會住宅上限內 LTV 可到 `100%`
- 超過社會住宅上限至 `₱750,000` 可到 `95%`
- 經濟住宅上限內可到 `95%`
- 超過經濟住宅上限至 `₱6,000,000` 可到 `90%`

這代表第一版模組若用 `20%` 頭期款作為一般情境，是偏保守且合理的預設。

## 通膨與事件模組建議

### Manila / NCR

- NCR `2025-12` inflation：`2.3%`
- NCR CPI `2025-12`：`127.3`（2018=100）

建議：

- 初始 `annualExpense` 通膨假設可先用 `2.5%`
- 事件池偏重：
  - 通勤與租屋成本上升
  - 淹水 / 颱風 / 停班停課
  - BPO/office layoff
  - 醫療與私校支出壓力

### Cebu / Central Visayas

- Central Visayas `2026-01` inflation：`5.6%`
- Central Visayas `2025` 年平均 inflation：`2.5%`
- City of Cebu bottom-30% inflation `2025-04`：`0.8%`

建議：

- 初始 `annualExpense` 通膨假設可先用 `3.0%`
- 事件池偏重：
  - 颱風 / 航班中斷 / 停電停水
  - 旅遊景氣波動
  - BPO / service sector hiring cycles
  - 食品價格波動

## 職業模組建議

目前最適合當第一版薪資錨點的官方資料，是 PSA 的 `2022 Occupational Wages Survey`。

已確認數字：

- NCR 記帳/簿記職平均月薪：`₱24,530`
- Central Visayas 記帳/簿記職平均月薪：`₱18,989`
- 全國基準職平均月薪：`₱19,676`
- 全國無技術工平均月薪：`₱12,276`

建議第一版菲律賓職業模組先不要做 10 職業完整重建，可先做：

1. `office`
2. `service`
3. `skilled_technical`
4. `it_bpo`
5. `management`

並用 Manila 相對 Cebu 約 `1.15x - 1.25x` 的薪資差作為初始城市 multiplier。

## 建議的 MVP 數值結論

### Manila MVP

```ts
baseMonthlyNetSalary: 27_000
minimumDailyWage: 695
defaultAnnualIncome: 540_000
defaultAnnualExpense: 360_000
defaultAnnualContribution: 100_000
defaultPriceToIncomeRatio: 9
mortgageRate: 0.074
cityCenterRent1BR: 33_970
cityCenterPricePerSqm: 266_125
inflationBaseline: 0.025
```

### Cebu MVP

```ts
baseMonthlyNetSalary: 23_000
minimumDailyWage: 540
defaultAnnualIncome: 420_000
defaultAnnualExpense: 240_000
defaultAnnualContribution: 80_000
defaultPriceToIncomeRatio: 7
mortgageRate: 0.070
cityCenterRent1BR: 31_792
cityCenterPricePerSqm: 183_000
inflationBaseline: 0.030
```

## 資料缺口

以下資料還值得補：

1. Cebu City 官方城市級家庭年收入
2. Manila City 官方城市級家庭年支出
3. Philippine REITs / bond / cash 的長期投資回報資料
4. Manila 與 Cebu 的醫療自付額、私校學費、交通成本官方分布
5. 城市級災害事件頻率與損失率，用於事件機率校準

## 建議下一步

1. 先新增 `ph-manila` / `ph-cebu` 到 `regions.ts`
2. 先做 6 個 lifestyle preset，不急著一次補完整職業系統
3. 先用 PHP 現金流 + 國際資產代理資料跑通模擬
4. 第二階段再補菲律賓本地投資資產歷史資料
5. 第三階段再把事件池做城市差異化

## 來源

- PSA FIES 2023: https://psa.gov.ph/content/average-annual-family-income-2023-estimated-php-35323-thousand?vcode=bDBN9m
- PSA OWS 2022: https://psa.gov.ph/content/highlights-2022-occupational-wages-survey-ows
- NWPC NCR wage order: https://nwpc.dole.gov.ph/ncr/
- NWPC Central Visayas wage order: https://nwpc.dole.gov.ph/private-workers-and-domestic-workers-in-central-visayas-to-receive-increases-in-minimum-wage/
- PSA NCR CPI Dec 2025: https://rssoncr.psa.gov.ph/content/summary-inflation-report-consumer-price-index-2018100-national-capital-region-december-2025
- PSA Central Visayas CPI Jan 2026: https://rsso07.psa.gov.ph/content/summary-inflation-report-central-visayas-consumer-price-index-all-income-households-12
- PSA Cebu City CPI Apr 2025: https://rsso07.psa.gov.ph/content/summary-inflation-report-city-cebu-consumer-price-index-2018100-april-2025
- BSP RPPI Q1 2025: https://www.bsp.gov.ph/Media_And_Research/RPPI/RPPI-Report-2025-Q1.pdf
- Pag-IBIG housing loan policy summary: https://www.pagibigfund.gov.ph/document/pdf/transparency/2022/Pag-IBIG%20Corporate%20Annual%20Report%202022%20%28Uploaded%20March%2030%2C%202023%2C%20Updated%20August%203%2C%202023%29.pdf
- Numbeo Manila: https://www.numbeo.com/cost-of-living/in/Manila
- Numbeo Cebu: https://www.numbeo.com/cost-of-living/in/Cebu
