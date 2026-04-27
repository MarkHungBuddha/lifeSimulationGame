# Philippines Module Implementation Plan

## Scope

This document defines the first implementation plan for a Philippines module.

The recommended scope is:

- English only
- City-level variants, not a full national Philippines simulation
- Two regions:
  - `ph-manila`
  - `ph-cebu`
- MVP first, calibration second

Out of scope for MVP:

- Filipino / Tagalog localization
- Full Philippines nationwide averages
- Full occupation parity with US / TW / JP on day one
- Manila/Cebu custom event packs

## Product Decision

Use Philippines support as two city scenarios under one currency system:

- Manila / NCR
- Cebu / Central Visayas / Metro Cebu proxy

This is more defensible than claiming a complete Philippines module, because the current research is city-leaning and uses mixed official and proxy data.

## Current Code Impact

The current codebase is hard-wired to `us | tw | jp` in several places, so adding PH is not only a data task.

Affected areas:

- `src/config/regions.ts`
- `src/engine/housingData.ts`
- `src/engine/occupationTypes.ts`
- `src/engine/occupationData.ts`
- `src/engine/occupationEngine.ts`
- `src/store/gameStore.ts`
- `src/components/Controls.tsx`
- `src/components/ResultPanel.tsx`
- `src/store/savedRecords.ts`

Secondary impact:

- any tests that assume only 3 regions
- any formatting logic that assumes TW/JP large-number units

## Implementation Order

### Phase 1: Region support

Goal: make `ph-manila` and `ph-cebu` valid regions without breaking the app.

Tasks:

- Add `ph-manila` and `ph-cebu` to `Region`
- Add region configs with:
  - English names
  - PHP currency
  - `₱` currency symbol
  - English asset labels
- Add slider ranges for both regions
- Update currency formatting so PHP uses plain numeric formatting, not TW/JP large-number shorthand
- Confirm save/load accepts the new region values

Definition of done:

- Region tabs or selectors can switch to both PH regions
- No formatter shows broken currency text
- Persisted records can round-trip both PH regions

### Phase 2: Lifestyle presets

Goal: avoid accidental fallback to US presets.

Tasks:

- Add `src/engine/lifestyle_ph.ts`
- Create 6 presets for each PH region:
  - `frugal`
  - `moderate`
  - `comfortable`
  - `luxury`
  - `lean_fire`
  - `fat_fire`
- Update `gameStore.ts` preset dispatch
- Update `ResultPanel.tsx` preset lookup

Definition of done:

- Switching to PH never uses US preset values by default
- Income, expense, and withdrawal defaults match PH presets

### Phase 3: Housing support

Goal: make housing module usable for PH MVP.

Tasks:

- Add PH entries to `src/engine/housingData.ts`
- Use MVP calibration:
  - Manila:
    - `defaultPriceToIncomeRatio: 9`
    - `mortgageRate: 0.074`
  - Cebu:
    - `defaultPriceToIncomeRatio: 7`
    - `mortgageRate: 0.070`
- Add any missing PH-specific text labels if needed
- Add a note in documentation that rent and price-per-sqm are estimate proxies

Definition of done:

- Housing module works in both PH regions
- No undefined housing params enter the simulator
- Defaults are stable enough for MVP playtesting

### Phase 4: Occupation handling

Goal: avoid shipping bad salary data under a complete occupation system.

Recommended MVP choice:

- Disable occupation mode for PH regions initially

Alternative if occupation must exist in MVP:

- Add a limited PH occupation model with 5 proxy categories
- Do not claim parity with the 10-category system

Why:

- Current occupation model requires full `Record<Region, ...>` coverage
- Research currently supports only partial proxy mapping
- Cebu values still rely on multipliers rather than direct official coverage

Definition of done for recommended MVP:

- PH regions do not crash occupation UI
- Occupation toggle is hidden or disabled for PH

Definition of done for alternative MVP:

- Every PH-supported occupation has salary and raise data
- UI does not reference missing `baseSalary[region]` or `raiseRange[region]`

### Phase 5: Events

Goal: keep MVP simple and avoid speculative localization.

Tasks:

- Reuse generic event system for PH MVP
- Do not add Manila/Cebu-specific events yet
- Keep future PH event ideas in backlog:
  - BPO hiring/layoff cycles
  - typhoon/flood disruption
  - fuel/transport shock
  - tourism/service recovery cycle

Definition of done:

- PH simulations run with stable event behavior
- No PH-specific event data is required for MVP launch

### Phase 6: Tests

Goal: protect against regressions when new regions are added.

Minimum tests:

- region switch uses correct presets
- PH region save/load round-trip
- PH housing params resolve correctly
- PH currency formatting is stable
- PH occupation-disabled path does not crash

## TODO List

### Blockers

- Decide whether PH occupation is disabled in MVP or implemented as a reduced proxy model
- Decide whether PH region names in UI should be `Manila` / `Cebu` or `Philippines - Manila` / `Philippines - Cebu`

### Required TODOs

- `TODO-1` Add PH regions to `src/config/regions.ts`
- `TODO-2` Add PHP-safe currency formatting
- `TODO-3` Create `src/engine/lifestyle_ph.ts`
- `TODO-4` Route PH presets in `gameStore.ts`
- `TODO-5` Route PH presets in `ResultPanel.tsx`
- `TODO-6` Add PH housing params in `housingData.ts`
- `TODO-7` Disable or gate occupation mode for PH
- `TODO-8` Add PH smoke tests
- `TODO-9` Update docs to state English-only support

### Nice-to-have TODOs

- `TODO-10` Add PH-specific asset labels for REIT/bond wording refinement
- `TODO-11` Add Manila/Cebu scenario description copy in UI
- `TODO-12` Add a visible disclaimer for proxy-based housing data

## Data Accuracy Review

This section classifies the current research data by confidence level.

### High confidence

These items are supported by official sources and can be used directly in MVP documentation and defaults.

- NCR minimum wage `₱695`, effective `2025-07-18`
- Central Visayas minimum wage `₱540`, approved `2025-09-11`, effective `2025-10-04`
- FIES 2023:
  - NCR annual family income `₱513.52k`
  - NCR annual family expenditure `₱385.05k`
  - Central Visayas annual family expenditure `₱218.03k`
- OWS 2022 benchmark clerical wage:
  - NCR `₱24,530`
  - Central Visayas `₱18,989`
- BSP RPPI Q1 2025:
  - NCR `+13.9% YoY`
  - Metro Cebu `-1.7% YoY`
- NCR inflation `2.3%` in December 2025
- NCR CPI `127.3` in December 2025
- Central Visayas inflation `5.6%` in January 2026
- Cebu City bottom-30% inflation `0.8%` in April 2025
- Pag-IBIG LTV rules used in the research are directionally correct

### Medium confidence

These are usable for MVP, but they should be labeled as estimates or snapshots.

- Numbeo salary estimates
- Numbeo rent values
- Numbeo price-per-sqm values
- Numbeo mortgage rates
- Derived `priceToIncomeRatio`
- Derived `annualHoldingCostRatio`
- Derived `rentToValueRatio`

Implementation rule:

- Keep these values in config
- Mark them as proxy-based in docs
- Expect periodic drift

### Low confidence / not yet sufficient

These should not be treated as validated system data yet.

- Full 10-occupation salary map for Manila
- Full 10-occupation salary map for Cebu
- Cebu salary multiplier assumptions against Manila
- PH-specific raise ranges by occupation
- PH-specific event probabilities and event impacts
- national Philippines claims based on Manila/Cebu-only numbers

## Data Corrections Needed

### Correction 1: Central Visayas 2025 inflation wording

The research currently uses `Central Visayas 2025 inflation = 2.5%` as a summary statement.

Safer wording:

- Central Visayas inflation was `2.5%` in January 2025 and February 2025
- The January to March 2025 average was around `2.5%`

Do not present this as a confirmed full-year official average unless a direct annual summary is added.

### Correction 2: Central Visayas wage date wording

Use exact dates:

- approved: `2025-09-11`
- effective: `2025-10-04`

Do not use the approval date as the implementation date.

### Correction 3: Numbeo should be treated as a snapshot

Do not describe Numbeo values as stable source-of-truth data.

Recommended wording:

- Numbeo snapshot as of April 2026
- Used as a city-level market proxy

## Recommended MVP Defaults

### Manila

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

### Cebu

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

These values are reasonable for MVP, but should be described as calibration defaults, not audited economic truth.

## Source Links

Official sources:

- PSA FIES 2023: https://psa.gov.ph/content/average-annual-family-income-2023-estimated-php-35323-thousand?vcode=bDBN9m
- PSA OWS 2022 national summary: https://psa.gov.ph/content/highlights-2022-occupational-wages-survey-ows?vcode=AaFl
- PSA OWS 2022 Central Visayas summary: https://rsso07.psa.gov.ph/content/highlights-results-2022-occupational-wages-survey-ows-central-visayas
- NWPC NCR wage board: https://nwpc.dole.gov.ph/ncr/
- NWPC Central Visayas wage order: https://nwpc.dole.gov.ph/private-workers-and-domestic-workers-in-central-visayas-to-receive-increases-in-minimum-wage/
- PSA NCR CPI December 2025: https://rssoncr.psa.gov.ph/content/summary-inflation-report-consumer-price-index-2018100-national-capital-region-december-2025
- PSA Central Visayas CPI January 2026: https://rsso07.psa.gov.ph/content/summary-inflation-report-central-visayas-consumer-price-index-all-income-households-12
- PSA Cebu City bottom-30 CPI April 2025: https://rsso07.psa.gov.ph/index.php/content/summary-inflation-report-city-cebu-consumer-price-index-bottom-30-income-households-12
- BSP RPPI Q1 2025: https://www.bsp.gov.ph/Media_And_Research/RPPI/RPPI-Report-2025-Q1.pdf
- Pag-IBIG annual report / housing loan rules reference: https://www.pagibigfund.gov.ph/document/pdf/transparency/2022/Pag-IBIG%20Corporate%20Annual%20Report%202022%20%28Uploaded%20March%2030%2C%202023%2C%20Updated%20August%203%2C%202023%29.pdf

Proxy sources:

- Numbeo Manila: https://www.numbeo.com/cost-of-living/in/Manila
- Numbeo Cebu: https://www.numbeo.com/cost-of-living/in/Cebu
- Numbeo Cebu property: https://www.numbeo.com/property-investment/in/Cebu
