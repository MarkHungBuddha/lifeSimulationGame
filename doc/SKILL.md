---
name: monte-carlo-life-simulator
description: Maintain and extend this React/Vite Monte Carlo life simulation game. Use when working on simulation logic, regional modules, housing, immigration, occupation, random events, story mode, result charts, controls, i18n, saved records, or project documentation in this repository.
---

# Monte Carlo Life Simulator

## Project Shape

This app is a React + Vite + TypeScript financial life simulator. It has two user-facing modes:

- **Simulation view**: batch Monte Carlo retirement simulation using block bootstrap market paths.
- **Story view**: one concrete year-by-year life path using the same assumptions and engines.

Core stack:

- UI: React, MUI, Zustand.
- Build: Vite.
- Engine: TypeScript simulation modules under `src/engine`.
- Data: historical returns in `data/assets_returns.json` and `assets_returns.json`.
- i18n: `src/i18n/messages.ts`, `src/i18n.tsx`, `src/i18n/types.ts`.

## Start Here

Before changing code:

1. Run `git status --short` and preserve unrelated user changes.
2. Search with `rg` first.
3. Read the smallest relevant files before editing.
4. Keep UI copy and new labels i18n-aware across `en`, `zh-Hant`, and `ja`.
5. Prefer existing local patterns over new abstractions.

Useful commands:

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

## Main Files

Use this map to load only the needed context:

- `src/App.tsx`: app shell, top bar, drawer/layout.
- `src/components/Controls.tsx`: user inputs, scenario saving/loading entry points, simulation/story run buttons.
- `src/components/GuidePanel.tsx`: empty-state guide and workflow diagram.
- `src/components/ResultPanel.tsx`: simulation summary, survival rate, percentile chart, drawdown cards, result table.
- `src/components/StoryPanel.tsx`: single-path story result, timeline, life event display.
- `src/components/SavedRecordsDialog.tsx`: saved scenario picker.
- `src/store/gameStore.ts`: Zustand state, actions, simulation/story orchestration.
- `src/store/savedRecords.ts`: local saved records.
- `src/config/regions.ts`: region definitions, labels, currency formatting, slider ranges.
- `src/i18n/messages.ts`: shared i18n message catalog.
- `src/i18n/lifestyles.ts`: localized lifestyle display names/copy.
- `src/engine/bootstrap.ts`: block bootstrap return sampling.
- `src/engine/runner.ts`: batch Monte Carlo runner.
- `src/engine/worker.ts`: web worker wrapper for batch simulation.
- `src/engine/simulator.ts`: single-path yearly simulation engine.
- `src/engine/housing*.ts`: housing types, params, and annual housing processing.
- `src/engine/immigration*.ts`: immigration route data, state, and transitions.
- `src/engine/occupation*.ts`: occupation data, salary growth, defaults.
- `src/events/event*.ts`: event types, database, selection, and effects.
- `tests/engine.test.ts`: current engine regression tests.

## Simulation Model

Batch simulation flow:

1. Build many sampled market paths with `runMonteCarlo` in `src/engine/runner.ts`.
2. Generate each path with `simulatePath` in `src/engine/simulator.ts`.
3. Aggregate success rate, final portfolio percentiles, depletion age, and drawdowns.
4. Show output in `ResultPanel.tsx`.

Single story flow:

1. Use the same assumptions and engines.
2. Generate one path in `gameStore.runStory`.
3. Show yearly snapshots, events, housing, immigration, and occupation milestones in `StoryPanel.tsx`.

When changing engine behavior, check whether both batch simulation and story mode should change. Avoid fixing only one path unless the request is explicitly mode-specific.

## Regional Rules

Supported regions are managed through `src/config/regions.ts`. Current UI supports:

- `us`
- `tw`
- `jp`
- `ph-manila`
- `ph-cebu`

Before adding or changing a region:

1. Update region config, labels, currency formatting, and slider ranges.
2. Check lifestyle presets and localized lifestyle display.
3. Check housing params.
4. Check random event database selection.
5. Verify unsupported modules are disabled or guarded in `Controls.tsx`.

## UI And i18n Rules

All user-facing strings in shared app panels should use i18n:

- Put reusable app copy in `src/i18n/messages.ts`.
- Keep language coverage aligned for `en`, `zh-Hant`, and `ja`.
- For copy local to `Controls.tsx`, keep the existing `COPY` object pattern unless doing a broader refactor.
- Do not put large glossary blocks on the home/empty state. Put explanations next to the feature or metric as Help buttons/tooltips.
- Empty-state guide content belongs in `GuidePanel.tsx`.
- Result metric explanations belong beside the metric in `ResultPanel.tsx`.
- Control explanations belong beside the relevant control group in `Controls.tsx`.

Recent guide convention:

- The workflow diagram has five steps: setup, assumptions, optional modules, start Monte Carlo simulation, review/generate output.
- In story mode, step 4 still starts Monte Carlo simulation. Step 5 generates and reviews the story path.
- The old suggested-step cards should not be rendered on the home guide.

## Feature Patterns

### Adding a module

For a new life module:

1. Add types in `src/engine/<module>Types.ts`.
2. Add defaults/parameters in `src/engine/<module>Data.ts`.
3. Add deterministic logic in `src/engine/<module>Engine.ts`.
4. Thread it through `SimulationParams` and `YearSnapshot` in `src/engine/simulator.ts`.
5. Add store state/actions in `src/store/gameStore.ts`.
6. Add controls in `src/components/Controls.tsx`.
7. Add output display in `ResultPanel.tsx` or `StoryPanel.tsx`.
8. Add or update tests if behavior affects shared simulation results.

### Random events

Event data lives in region-specific databases:

- `src/events/eventDatabase.ts`
- `src/events/eventDatabase_tw.ts`
- `src/events/eventDatabase_jp.ts`
- `src/events/eventDatabase_ph.ts`

Event effects are normalized/applied through:

- `src/events/eventEffects.ts`
- `src/events/eventEngine.ts`

When adding event effects, keep batch and story output consistent.

Philippines random events are shared by `ph-manila` and `ph-cebu` for the current MVP. Keep PH event IDs prefixed with `ph_`, avoid occupation-specific PH events until PH occupation support exists, and prefer conservative Manila/Cebu differences through explicit region-aware logic rather than falling back to the US database.

### Housing

Housing state and calculations live under:

- `src/engine/housingTypes.ts`
- `src/engine/housingData.ts`
- `src/engine/housingEngine.ts`

Housing affects investable cash through down payment, closing costs, mortgage payments, holding costs, and house value/equity snapshots.

### Immigration

Immigration state and routes live under:

- `src/engine/immigrationTypes.ts`
- `src/engine/immigrationData.ts`
- `src/engine/immigrationEngine.ts`

Immigration can change active region assumptions. Check both income/expense multipliers and post-move allocation.

## Validation

Choose validation based on change risk:

- UI/i18n-only: `npm.cmd run build`.
- Engine logic: `npm.cmd test` and `npm.cmd run build`.
- Simulation aggregation: add or update `tests/engine.test.ts`.
- Visual layout changes: run the dev server and inspect desktop/mobile if feasible.

Known build note: Vite may warn that the main chunk is larger than 500 kB. Treat it as a warning unless the task is specifically about bundle size.

## Reference Docs

Load these only when relevant:

- `doc/monte_carlo_random_events.md`: random event model details.
- `doc/monte_carlo_taiwan.md`: Taiwan-specific simulation notes.
- `doc/monte_carlo_japan.md`: Japan-specific simulation notes.
- `doc/ph-module-implementation-plan.md`: Philippines module plan.
- `doc/ph-cebu-manila-module-research.md`: Philippines region research.
- `doc/ph-random-event-library-plan.md`: Philippines random event library plan.
- `doc/immigration-event-fix-plan.md`: event effect and immigration consistency plan.
- `doc/demo-feature-flag-block-plan.md`: demo feature gating and blocked feature copy plan.
- `doc/mobile-first-controls-ux-plan.md`: mobile controls UX plan.
- `doc/simulator-guided-flow-plan.md`: simulator guided flow plan.
- `doc/ui_improvement_execution_plan.md`: UI improvement execution plan.
- `doc/PLAN.md`: broader project roadmap.
