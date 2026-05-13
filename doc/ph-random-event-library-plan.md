# Philippines Random Event Library Plan

## Scope

This plan starts the dedicated random event library for the Philippines regions:

- `ph-manila`
- `ph-cebu`

The goal is not to immediately build a full national event database. The first useful version should provide a defensible Manila/Cebu event pack that is better than falling back to the US event database, while keeping uncertain assumptions visible.

## Current Gap

Current `eventEngine.getEventData()` only routes:

- `us` -> `eventDatabase.ts`
- `tw` -> `eventDatabase_tw.ts`
- `jp` -> `eventDatabase_jp.ts`

Both Philippines regions currently fall through to the US database. That means PH simulations can trigger US-flavored career, health, property, legal, and macro events even though PH already has separate lifestyle and housing assumptions.

## Data Principles

Use official or primary sources first:

- PSA for labor force, inflation, family income/expenditure, and health accounts.
- PAGASA for tropical cyclone frequency and seasonal risk.
- BSP / official government reposts for remittances.
- IBPAP or government-reported IBPAP data for IT-BPM/BPO employment.
- Existing `doc/ph-cebu-manila-module-research.md` for Manila/Cebu lifestyle and housing calibration.

Use proxy sources only when the event is useful but official data is not available at city level. Mark those events as `medium` or `low` confidence.

## MVP Event Categories

### 1. Macro And Market

Recommended events:

- `ph_high_inflation`
  - Basis: PSA April 2026 national inflation reached 7.2%; NCR reached 5.5%; Central Visayas reached 10.8%.
  - Candidate probability: 0.06 to 0.10 annual.
  - Candidate impacts: `extra_expense` 0.8-1.5x monthly income, `savings_change` -0.02 to -0.04.
  - Confidence: high for existence, medium for probability.

- `ph_transport_fuel_shock`
  - Basis: PSA April 2026 report identifies transport as a major inflation contributor.
  - Candidate probability: 0.05 to 0.08 annual.
  - Candidate impacts: `extra_expense` 0.5-1.0x monthly income, optional `income_change` -0.02 for commuting-sensitive work.
  - Confidence: medium.

- `ph_currency_pressure`
  - Basis: existing PH research already includes PHP currency and foreign-asset exposure; remittances and USD conversion matter for households.
  - Candidate probability: 0.03 to 0.05 annual.
  - Candidate impacts: `savings_change` -0.03 to -0.06 for imported-cost pressure, but positive remittance variants should be separate.
  - Confidence: medium.

### 2. Weather And Disaster

Recommended events:

- `ph_typhoon_disruption`
  - Basis: PAGASA states about 20 tropical cyclones enter PAR per year and about 8 or 9 cross the Philippines.
  - Candidate probability:
    - Manila: 0.08 to 0.12 annual.
    - Cebu: 0.05 to 0.09 annual.
  - Candidate impacts: `extra_expense` 0.5-2.0x monthly income, `income_change` -0.03 to -0.08 for 1-3 months.
  - Confidence: high for national hazard, medium for city split.

- `ph_flood_home_repair`
  - Basis: use PAGASA/NDRRMC/PAGASA ARTC as event source family; calibrate city impact later.
  - Candidate probability:
    - Manila: 0.04 to 0.08 annual.
    - Cebu: 0.03 to 0.06 annual.
  - Candidate impacts: `extra_expense` 1.0-3.0x monthly income; owner extra impact can be higher once housing module is active.
  - Confidence: medium.

- `ph_disaster_aid_recovery`
  - Positive/offset event paired with typhoon/flood shocks.
  - Candidate probability: correlated with typhoon/flood event, 0.30 to 0.50 conditional.
  - Candidate impacts: `savings_boost` 0.01-0.03 or partial expense offset.
  - Confidence: low until a benefit/aide source is selected.

### 3. Career And Income

Recommended events:

- `ph_job_loss`
  - Basis: PSA March 2026 LFS shows unemployment rate at 5.0%; 2025 full-year preliminary unemployment was 4.2%.
  - Candidate probability: 0.012 to 0.025 annual, age adjusted.
  - Candidate impacts: `income_change` -0.40 to -0.60 for 3-8 months, `extra_expense` 0.5-1.0x monthly income.
  - Confidence: high for labor data, medium for individual transition probability.

- `ph_underemployment_hours_cut`
  - Basis: PSA March 2026 LFS underemployment was 12.3%; 2025 full-year preliminary underemployment was 11.9%.
  - Candidate probability: 0.04 to 0.08 annual.
  - Candidate impacts: `income_change` -0.10 to -0.20 for 3-12 months.
  - Confidence: high for macro data, medium for simulator mapping.

- `ph_bpo_growth_bonus`
  - Basis: ITBPM revenue grew to USD 38B in 2024 and full-time employment reached 1.82M.
  - Candidate probability: 0.03 to 0.06 annual.
  - Candidate impacts: `income_change` +0.05 to +0.10 for 6-12 months or `savings_boost` +0.03.
  - Confidence: medium.

- `ph_bpo_automation_or_account_loss`
  - Basis: ITBPM growth source also highlights AI/upskilling pressure.
  - Candidate probability: 0.02 to 0.04 annual; higher if future PH occupation module has `it_bpo`.
  - Candidate impacts: `income_change` -0.15 to -0.30 for 3-9 months.
  - Confidence: medium-low until occupation module exists.

### 4. Health

Recommended events:

- `ph_medical_bill`
  - Basis: PSA PNHA 2023 says household out-of-pocket payment was 44.4% of current health expenditure; per-capita health spending was PHP 11,083.
  - Candidate probability: reuse age gradient from existing health event model, but lower direct-cost multiplier than US.
  - Candidate impacts: `extra_expense` 1.0-4.0x monthly income, `income_change` -0.05 for 1-3 months.
  - Confidence: high for OOP risk, medium for event frequency.

- `ph_major_illness_income_gap`
  - Basis: same PNHA OOP exposure plus existing generic major illness model.
  - Candidate probability: 0.003 to 0.012 annual by age.
  - Candidate impacts: `income_change` -0.30 to -0.60 for 6-36 months, `extra_expense` 4.0-10.0x monthly income.
  - Confidence: medium.

### 5. Family And Remittances

Recommended events:

- `ph_family_support_obligation`
  - Basis: PH household model and remittance economy imply extended-family cash support is important, but direct event probability needs more sourcing.
  - Candidate probability: 0.04 to 0.08 annual.
  - Candidate impacts: `extra_expense` 0.5-2.0x monthly income or permanent `savings_boost` -0.02.
  - Confidence: low-medium.

- `ph_remittance_windfall`
  - Basis: official BSP-reposted data show OF remittances remain a large and resilient household cash-flow channel.
  - Candidate probability: 0.02 to 0.05 annual.
  - Candidate impacts: `savings_boost` +0.03 to +0.10 one-time.
  - Confidence: medium.

- `ph_remittance_interruption`
  - Basis: use as downside counterpart to remittance dependence; needs OFW deployment or host-country shock source before implementation.
  - Candidate probability: 0.01 to 0.03 annual.
  - Candidate impacts: `income_change` -0.05 to -0.15 for 6-18 months.
  - Confidence: low.

## Region Modifiers

Initial modifiers should be conservative:

| Event | Manila | Cebu | Reason |
|---|---:|---:|---|
| `ph_high_inflation` | 0.9x | 1.2x | April 2026 Central Visayas inflation exceeded NCR. |
| `ph_transport_fuel_shock` | 1.2x | 0.9x | Manila commute exposure is higher in the current city assumptions. |
| `ph_typhoon_disruption` | 1.1x | 0.8x | NCR flood/commute disruption should be more visible; Cebu still has storm risk. |
| `ph_flood_home_repair` | 1.2x | 0.8x | Manila flood repair/rental disruption should be emphasized first. |
| `ph_bpo_growth_bonus` | 1.0x | 1.1x | Cebu IT Park/BPO exposure can be represented once occupation support exists. |
| `ph_family_support_obligation` | 1.0x | 1.0x | Keep neutral until better city data exists. |

## Modeling Rules

- Add `src/events/eventDatabase_ph.ts` with one shared PH database plus optional `regionModifiers`.
- Add `src/events/eventDatabase_ph.test` coverage through `tests/engine.test.ts` or a dedicated event test if the file grows.
- Update `getEventData(region)` so `ph-manila` and `ph-cebu` use the PH database.
- Do not enable PH occupation-specific events until PH occupation mode exists.
- For `income_change`, rely on the current duration-month prorating so 3-9 month shocks are not treated as full-year losses.
- Keep `extra_expense` as monthly-income multiples. Do not multiply those by duration unless the event explicitly represents recurring costs.
- Avoid `permanent` effects in MVP except for clearly recurring family support or housing/childcare-like events.

## Implementation Plan

### Phase 1: Data Scaffold

- Create `src/events/eventDatabase_ph.ts`.
- Include 10-14 MVP events across macro, weather, career, health, and family/remittance categories.
- Keep event names/descriptions in English first, consistent with current PH module scope.
- Add source comments per event group.

### Phase 2: Routing And Smoke Tests

- Route PH regions in `eventEngine.getEventData`.
- Add tests that `ph-manila` and `ph-cebu` no longer return US-only event IDs.
- Add tests that no occupation-specific PH event triggers when `occupationId = 0`.

### Phase 3: Calibration Diagnostics

- Run 10,000 path diagnostics for:
  - Manila moderate, events off/on.
  - Cebu moderate, events off/on.
  - US moderate as a control.
- Target first-pass event-enabled success rate should be meaningfully lower than no-events, but not catastrophically lower. Use the current random-event PR as baseline.

### Phase 4: UI/Story Readiness

- Confirm StoryPanel displays PH event names/descriptions cleanly.
- If story mode remains feature-flagged off, only engine tests are required.
- Do not add new UI controls for PH events in this phase.

## Open Questions

- Should PH event descriptions be English-only for now, matching the current PH module, or should they enter the i18n backlog immediately?
- Should remittance events be always available, or only enabled by a future household/family profile module?
- Should weather events have city-specific probabilities, or a single PH probability with city impact modifiers?
- Should PH use a smaller health-cost cap than US because event impacts are tied to local monthly income, or should the existing cap remain shared?

## Source Links

- PSA Labor Force Survey March 2026: https://psa.gov.ph/system/files/iesd/Press-Release-for-March-2026-LFS.pdf
- PSA CPI / Inflation April 2026: https://psa.gov.ph/price-indices/cpi-ir
- PSA FIES 2023 landing and tables: https://psa.gov.ph/statistics/income-expenditure/fies?vcode=0Yq1
- PSA Philippine National Health Accounts 2023: https://psa.gov.ph/content/households-share-444-percent-countrys-total-health-spending-2023?vcode=rY54
- PAGASA Tropical Cyclone Information: https://www.pagasa.dost.gov.ph/climate/tropical-cyclone-information
- PAGASA Annual Report on Philippine Tropical Cyclones: https://www.pagasa.dost.gov.ph/tropical-cyclone/publications/annual-report
- PIA/BSP remittance release, March 2025: https://pia.gov.ph/news/personal-remittances-rise-by-2-6-yoy-to-us3-1-billion-in-march-2025-cumulative-total-reaches-us9-4-billion/
- PNA / IBPAP ITBPM 2024 report: https://www.pna.gov.ph/index.php/articles/1241876
- Existing PH module plan: `doc/ph-module-implementation-plan.md`
- Existing PH Manila/Cebu research: `doc/ph-cebu-manila-module-research.md`
